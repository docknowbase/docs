// types/common.ts
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// domain/ports/types.ts
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ViewportDimensions extends Dimensions {}

export interface MenuDimensions extends Dimensions {}

// domain/models/menu.ts
export interface BaseMenuOption {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
}

export interface ClickableMenuOption extends BaseMenuOption {
  onClick: () => void;
  children?: never;
}

export interface SubmenuOption extends BaseMenuOption {
  children: MenuOption[];
  onClick?: never;
}

export type MenuOption = ClickableMenuOption | SubmenuOption;

export interface ActiveMenu {
  id: string;
  level: number;
  position: Position;
}

export interface MenuState {
  activeMenus: ActiveMenu[];
  activeRootMenu: Nullable<string>;
}

// domain/ports/menuPort.ts
import { Position, MenuDimensions } from "./types";
import { ActiveMenu } from "../models/menu";

export interface CalculateMenuPositionParams {
  parentPosition: Position;
  itemHeight: number;
  index: number;
  level: number;
  menuDimensions: MenuDimensions;
}

export interface HandleMenuActivationParams {
  currentMenus: ActiveMenu[];
  newMenu: Nullable<ActiveMenu>;
}

export interface GetInitialPositionParams {
  menuBarElement: HTMLElement;
  index: number;
}

export interface MenuPort {
  calculateMenuPosition: (params: CalculateMenuPositionParams) => Position;
  handleMenuActivation: (params: HandleMenuActivationParams) => ActiveMenu[];
  getInitialPosition: (params: GetInitialPositionParams) => Position;
}

// infrastructure/adapters/menuAdapter.ts
import {
  MenuPort,
  CalculateMenuPositionParams,
  HandleMenuActivationParams,
  GetInitialPositionParams,
} from "../../domain/ports/menuPort";
import { Position, ViewportDimensions } from "../../domain/ports/types";
import { ActiveMenu } from "../../domain/models/menu";

export class MenuAdapter implements MenuPort {
  private getViewportDimensions(): ViewportDimensions {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  public calculateMenuPosition({
    parentPosition,
    itemHeight,
    index,
    level,
    menuDimensions,
  }: CalculateMenuPositionParams): Position {
    const viewport: ViewportDimensions = this.getViewportDimensions();

    let x: number = parentPosition.x;
    let y: number = parentPosition.y + index * itemHeight;

    if (level > 0) {
      x = parentPosition.x + menuDimensions.width - 2;
      y = parentPosition.y + index * itemHeight - itemHeight * index;
    }

    // Boundary checks
    if (x + menuDimensions.width > viewport.width) {
      x = level === 0 ? x : parentPosition.x - menuDimensions.width + 2;
    }

    if (y + menuDimensions.height > viewport.height) {
      y = viewport.height - menuDimensions.height - 4;
    }

    return { x, y };
  }

  public handleMenuActivation({
    currentMenus,
    newMenu,
  }: HandleMenuActivationParams): ActiveMenu[] {
    if (!newMenu) {
      return [];
    }

    const filtered = currentMenus.filter((m) => m.level < newMenu.level);
    return [...filtered, newMenu];
  }

  public getInitialPosition({
    menuBarElement,
    index,
  }: GetInitialPositionParams): Position {
    const menuBarRect: DOMRect = menuBarElement.getBoundingClientRect();
    const menuItems: HTMLCollectionOf<Element> =
      menuBarElement.getElementsByClassName("menu-bar__root-item");
    const itemRect: DOMRect = menuItems[index].getBoundingClientRect();

    return {
      x: itemRect.left,
      y: menuBarRect.bottom,
    };
  }
}

// presentation/hooks/useMenuState.ts
import { useCallback, useState, RefObject } from "react";
import { MenuOption, MenuState, ActiveMenu } from "../../domain/models/menu";
import { MenuPort } from "../../domain/ports/menuPort";
import { Nullable } from "../../types/common";

interface UseMenuStateProps {
  menuPort: MenuPort;
  menuBarRef: RefObject<HTMLDivElement>;
}

interface MenuStateHandlers {
  handleRootMouseEnter: (item: MenuOption) => void;
  handleItemClick: (item: MenuOption, index?: number) => void;
  handleMenuActivate: (menu: Nullable<ActiveMenu>) => void;
  handleMenuSelect: () => void;
}

export const useMenuState = ({
  menuPort,
  menuBarRef,
}: UseMenuStateProps): {
  state: MenuState;
  handlers: MenuStateHandlers;
} => {
  const [state, setState] = useState<MenuState>({
    activeMenus: [],
    activeRootMenu: null,
  });

  const handleRootMouseEnter = useCallback(
    (item: MenuOption): void => {
      if (state.activeRootMenu !== null) {
        handleItemClick(item);
      }
    },
    [state.activeRootMenu]
  );

  const handleItemClick = useCallback(
    (item: MenuOption, index?: number): void => {
      if (item.disabled) return;

      setState((prevState) => {
        if (prevState.activeRootMenu === item.id) {
          return {
            activeRootMenu: null,
            activeMenus: [],
          };
        }

        if ("children" in item && menuBarRef.current) {
          const position = menuPort.getInitialPosition({
            menuBarElement: menuBarRef.current,
            index: index ?? 0,
          });

          return {
            activeRootMenu: item.id,
            activeMenus: [
              {
                id: item.id,
                level: 0,
                position,
              },
            ],
          };
        }

        if ("onClick" in item) {
          item.onClick();
          return {
            activeRootMenu: null,
            activeMenus: [],
          };
        }

        return prevState;
      });
    },
    [menuPort, menuBarRef]
  );

  const handleMenuActivate = useCallback(
    (menu: Nullable<ActiveMenu>): void => {
      setState((prevState) => ({
        ...prevState,
        activeMenus: menuPort.handleMenuActivation({
          currentMenus: prevState.activeMenus,
          newMenu: menu,
        }),
      }));
    },
    [menuPort]
  );

  const handleMenuSelect = useCallback((): void => {
    setState({
      activeRootMenu: null,
      activeMenus: [],
    });
  }, []);

  return {
    state,
    handlers: {
      handleRootMouseEnter,
      handleItemClick,
      handleMenuActivate,
      handleMenuSelect,
    },
  };
};

// presentation/components/SubMenu.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";
import { MenuOption, ActiveMenu } from "../../domain/models/menu";
import { Position, MenuDimensions } from "../../domain/ports/types";
import { MenuPort } from "../../domain/ports/menuPort";
import { Nullable } from "../../types/common";

interface SubMenuProps {
  options: MenuOption[];
  position: Position;
  level: number;
  parentId: string;
  activeMenus: ActiveMenu[];
  menuPort: MenuPort;
  onMenuActivate: (menu: Nullable<ActiveMenu>) => void;
  onMenuSelect: () => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({
  options,
  position,
  level,
  parentId,
  activeMenus,
  menuPort,
  onMenuActivate,
  onMenuSelect,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuDimensions, setMenuDimensions] = useState<MenuDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (menuRef.current) {
      const { offsetWidth, offsetHeight } = menuRef.current;
      setMenuDimensions({
        width: offsetWidth,
        height: offsetHeight,
      });
    }
  }, [options]);

  const handleMouseEnter = useCallback(
    (option: MenuOption, index: number): void => {
      if (option.disabled) return;

      const newPosition = menuPort.calculateMenuPosition({
        parentPosition: position,
        itemHeight: 28,
        index,
        level,
        menuDimensions,
      });

      if ("children" in option) {
        onMenuActivate({
          id: option.id,
          level: level + 1,
          position: newPosition,
        });
      }
    },
    [position, level, menuDimensions, menuPort, onMenuActivate]
  );

  const handleClick = useCallback(
    (option: MenuOption, event: React.MouseEvent): void => {
      event.stopPropagation();
      if (!option.disabled && "onClick" in option) {
        option.onClick();
        onMenuSelect();
      }
    },
    [onMenuSelect]
  );

  return (
    <div
      ref={menuRef}
      className={classNames("menu-bar__submenu", {
        "menu-bar__submenu--root": level === 0,
      })}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {options.map((option, index) => {
        const isActive = activeMenus.some((menu) => menu.id === option.id);

        if (option.separator) {
          return (
            <div
              key={`${parentId}-sep-${index}`}
              className="menu-bar__separator"
            />
          );
        }

        return (
          <div
            key={option.id}
            className={classNames("menu-bar__item", {
              "menu-bar__item--active": isActive,
              "menu-bar__item--disabled": option.disabled,
              "menu-bar__item--has-children": "children" in option,
            })}
            onMouseEnter={() => handleMouseEnter(option, index)}
            onClick={(e) => handleClick(option, e)}
          >
            <div className="menu-bar__item-content">
              {option.icon && (
                <span className="menu-bar__item-icon">{option.icon}</span>
              )}
              <span className="menu-bar__item-label">{option.label}</span>
              {option.shortcut && (
                <span className="menu-bar__item-shortcut">
                  {option.shortcut}
                </span>
              )}
              {"children" in option && (
                <span className="menu-bar__item-arrow">›</span>
              )}
            </div>

            {isActive && "children" in option && (
              <SubMenu
                options={option.children}
                position={
                  activeMenus.find((menu) => menu.id === option.id)?.position ??
                  position
                }
                level={level + 1}
                parentId={option.id}
                activeMenus={activeMenus}
                menuPort={menuPort}
                onMenuActivate={onMenuActivate}
                onMenuSelect={onMenuSelect}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// presentation/components/MenuBar.tsx
import React, { useRef, useEffect, useCallback } from "react";
import classNames from "classnames";
import { MenuOption } from "../../domain/models/menu";
import { MenuAdapter } from "../../infrastructure/adapters/menuAdapter";
import { useMenuState } from "../hooks/useMenuState";
import { SubMenu } from "./SubMenu";

interface MenuBarProps {
  items: MenuOption[];
  className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ items, className }) => {
  const menuBarRef = useRef<HTMLDivElement>(null);
  const menuPort = new MenuAdapter();
  const { state, handlers } = useMenuState({ menuPort, menuBarRef });

  const handleClickOutside = useCallback(
    (event: MouseEvent): void => {
      if (
        menuBarRef.current &&
        !menuBarRef.current.contains(event.target as Node)
      ) {
        handlers.handleMenuSelect();
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={menuBarRef} className={classNames("menu-bar", className)}>
      <div className="menu-bar__root">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={classNames("menu-bar__root-item", {
              "menu-bar__root-item--active": state.activeRootMenu === item.id,
              "menu-bar__root-item--disabled": item.disabled,
            })}
            onClick={() => handlers.handleItemClick(item, index)}
            onMouseEnter={() => handlers.handleRootMouseEnter(item)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {state.activeRootMenu && state.activeMenus.length > 0 && (
        <SubMenu
          options={
            items.find((item) => item.id === state.activeRootMenu)?.children ??
            []
          }
          position={state.activeMenus[0].position}
          level={0}
          parentId={state.activeRootMenu}
          activeMenus={state.activeMenus}
          menuPort={menuPort}
          onMenuActivate={handlers.handleMenuActivate}
          onMenuSelect={handlers.handleMenuSelect}
        />
      )}
    </div>
  );
};

export default MenuBar;
