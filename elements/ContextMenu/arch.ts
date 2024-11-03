// src/domain/types/types.ts
export interface Position {
    x: number;
    y: number;
  }
  
  export interface Dimensions {
    width: number;
    height: number;
  }
  
  export interface Viewport {
    width: number;
    height: number;
  }
  
  export interface MenuOption<T = unknown> {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    children?: MenuOption<T>[];
    onClick?: () => void;
    data?: T;
  }
  
  // src/domain/ports/contextMenuPort.ts
  import { Position, Dimensions, MenuOption } from '../types/types';
  
  export interface PositionConfig {
    parentPosition: Position;
    parentWidth: number;
    menuDimensions: Dimensions;
    index: number;
    viewport: Viewport;
  }
  
  export interface ContextMenuPort<T = unknown> {
    calculatePosition: (config: PositionConfig) => Position;
    handleOptionSelection: (option: MenuOption<T>) => void;
    closeMenu: () => void;
  }
  
  // src/domain/services/contextMenuService.ts
  import { ContextMenuPort, PositionConfig } from '../ports/contextMenuPort';
  import { Position, MenuOption } from '../types/types';
  
  export class ContextMenuService<T = unknown> implements ContextMenuPort<T> {
    private static readonly MENU_ITEM_HEIGHT = 32;
    private static readonly MENU_PADDING = 8;
  
    constructor(private readonly onClose: () => void) {}
  
    public calculatePosition({
      parentPosition,
      parentWidth,
      menuDimensions,
      index,
      viewport,
    }: PositionConfig): Position {
      const subMenuVerticalPosition =
        parentPosition.y +
        index * ContextMenuService.MENU_ITEM_HEIGHT -
        ContextMenuService.MENU_PADDING;
  
      const spaceOnRight =
        viewport.width - (parentPosition.x + parentWidth + menuDimensions.width);
  
      const x =
        spaceOnRight > 0
          ? parentPosition.x + parentWidth - ContextMenuService.MENU_PADDING
          : parentPosition.x - menuDimensions.width + ContextMenuService.MENU_PADDING;
  
      let y = subMenuVerticalPosition;
      if (y + menuDimensions.height > viewport.height) {
        y = viewport.height - menuDimensions.height - ContextMenuService.MENU_PADDING;
      }
  
      return { x, y };
    }
  
    public handleOptionSelection(option: MenuOption<T>): void {
      if (!option.children && !option.disabled && option.onClick) {
        option.onClick();
        this.closeMenu();
      }
    }
  
    public closeMenu(): void {
      this.onClose();
    }
  }
  
  // src/adapters/primary/hooks/useContextMenu.ts
  import { useState, useEffect, useCallback, useRef, RefObject } from 'react';
  import { MenuOption, Position, Dimensions } from '../../../domain/types/types';
  import { ContextMenuService } from '../../../domain/services/contextMenuService';
  
  interface UseContextMenuProps<T> {
    options: MenuOption<T>[];
    position: Position;
    onClose: () => void;
    parentWidth?: number;
  }
  
  interface UseContextMenuReturn<T> {
    menuRef: RefObject<HTMLDivElement>;
    activeSubmenu: string | null;
    menuDimensions: Dimensions;
    handleMouseEnter: (optionId: string) => void;
    handleMouseLeave: () => void;
    handleClick: (option: MenuOption<T>, event: React.MouseEvent) => void;
    calculateSubMenuPosition: (position: Position, index: number) => Position;
  }
  
  export function useContextMenu<T>({
    options,
    position,
    onClose,
    parentWidth = 0,
  }: UseContextMenuProps<T>): UseContextMenuReturn<T> {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuDimensions, setMenuDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  
    const contextMenuService = new ContextMenuService<T>(onClose);
  
    useEffect(() => {
      const updateDimensions = (): void => {
        if (menuRef.current) {
          setMenuDimensions({
            width: menuRef.current.offsetWidth,
            height: menuRef.current.offsetHeight,
          });
        }
      };
  
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [options]);
  
    const calculateSubMenuPosition = useCallback(
      (parentPos: Position, index: number): Position => {
        const viewport: Viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
  
        return contextMenuService.calculatePosition({
          parentPosition: parentPos,
          parentWidth,
          menuDimensions,
          index,
          viewport,
        });
      },
      [menuDimensions, parentWidth]
    );
  
    const handleMouseEnter = useCallback((optionId: string): void => {
      const option = options.find((opt) => opt.id === optionId);
      if (option?.children) {
        setActiveSubmenu(optionId);
      }
    }, [options]);
  
    const handleMouseLeave = useCallback((): void => {
      setActiveSubmenu(null);
    }, []);
  
    const handleClick = useCallback(
      (option: MenuOption<T>, event: React.MouseEvent): void => {
        event.stopPropagation();
        contextMenuService.handleOptionSelection(option);
      },
      [contextMenuService]
    );
  
    return {
      menuRef,
      activeSubmenu,
      menuDimensions,
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      calculateSubMenuPosition,
    };
  }
  
  // src/adapters/primary/components/SubMenu.tsx
  import React, { memo } from 'react';
  import classNames from 'classnames';
  import { MenuOption, Position } from '../../../domain/types/types';
  import { useContextMenu } from '../hooks/useContextMenu';
  
  interface SubMenuProps<T> {
    options: MenuOption<T>[];
    position: Position;
    onClose: () => void;
    className?: string;
    parentWidth: number;
    level: number;
  }
  
  export const SubMenu = memo(function SubMenu<T>({
    options,
    position,
    onClose,
    className,
    parentWidth,
    level,
  }: SubMenuProps<T>): JSX.Element {
    const {
      menuRef,
      activeSubmenu,
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      calculateSubMenuPosition,
    } = useContextMenu<T>({
      options,
      position,
      onClose,
      parentWidth,
    });
  
    return (
      <div
        ref={menuRef}
        className={classNames('context-menu', `context-menu--level-${level}`, className)}
        style={{ left: position.x, top: position.y }}
        onContextMenu={(e): void => {
          e.preventDefault();
        }}
      >
        {options.map((option, index) => (
          <div
            key={option.id}
            className={classNames('context-menu__item', {
              'context-menu__item--disabled': option.disabled,
              'context-menu__item--danger': option.danger,
              'context-menu__item--has-children': option.children,
              'context-menu__item--active': activeSubmenu === option.id,
            })}
            onMouseEnter={(): void => handleMouseEnter(option.id)}
            onMouseLeave={handleMouseLeave}
            onClick={(e): void => handleClick(option, e)}
          >
            {option.icon && (
              <span className="context-menu__item-icon">{option.icon}</span>
            )}
            <span className="context-menu__item-label">{option.label}</span>
            {option.children && (
              <span className="context-menu__item-arrow">›</span>
            )}
  
            {activeSubmenu === option.id && option.children && (
              <SubMenu<T>
                options={option.children}
                position={calculateSubMenuPosition(position, index)}
                onClose={onClose}
                parentWidth={menuRef.current?.offsetWidth || 0}
                level={level + 1}
              />
            )}
          </div>
        ))}
      </div>
    );
  });
  
  // src/adapters/primary/components/ContextMenu.tsx
  import React, { useEffect, memo } from 'react';
  import { MenuOption, Position } from '../../../domain/types/types';
  import { SubMenu } from './SubMenu';
  
  interface ContextMenuProps<T> {
    options: MenuOption<T>[];
    position: Position;
    onClose: () => void;
    className?: string;
  }
  
  export const ContextMenu = memo(function ContextMenu<T>({
    options,
    position,
    onClose,
    className,
  }: ContextMenuProps<T>): JSX.Element {
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent): void => {
        if (
          event.target instanceof Node &&
          !event.target.closest('.context-menu')
        ) {
          onClose();
        }
      };
  
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }, [onClose]);
  
    return (
      <SubMenu<T>
        options={options}
        position={position}
        onClose={onClose}
        parentWidth={0}
        level={0}
        className={className}
      />
    );
  });
  
  // Example usage with TypeScript
  // src/App.tsx
  import React, { useState } from 'react';
  import { ContextMenu } from './adapters/primary/components/ContextMenu';
  import { Position, MenuOption } from './domain/types/types';
  
  interface CustomData {
    description: string;
    metadata: {
      group: string;
      priority: number;
    };
  }
  
  const App: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{
      position: Position;
      visible: boolean;
    }>({
      position: { x: 0, y: 0 },
      visible: false,
    });
  
    const menuOptions: MenuOption<CustomData>[] = [
      {
        id: '1',
        label: 'Option 1',
        onClick: () => console.log('Option 1 clicked'),
        data: {
          description: 'First option description',
          metadata: {
            group: 'main',
            priority: 1,
          },
        },
      },
      {
        id: '2',
        label: 'Submenu',
        children: [
          {
            id: '2.1',
            label: 'Submenu Option 1',
            onClick: () => console.log('Submenu Option 1 clicked'),
            data: {
              description: 'Submenu option description',
              metadata: {
                group: 'sub',
                priority: 2,
              },
            },
          },
        ],
      },
    ];
  
    const handleContextMenu = (event: React.MouseEvent): void => {
      event.preventDefault();
      setContextMenu({
        position: { x: event.clientX, y: event.clientY },
        visible: true,
      });
    };
  
    const handleClose = (): void => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };
  
    return (
      <div onContextMenu={handleContextMenu} style={{ height: '100vh' }}>
        {contextMenu.visible && (
          <ContextMenu<CustomData>
            options={menuOptions}
            position={contextMenu.position}
            onClose={handleClose}
          />
        )}
      </div>
    );
  };
  
  export default App;
  
  // src/styles/contextMenu.scss
  .context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 0;
    min-width: 160px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  
    &__item {
      padding: 6px 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      position: relative;
  
      &:hover {
        background-color: #f5f5f5;
      }
  
      &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
  
        &:hover {
          background-color: transparent;
        }
      }
  
      &--danger {
        color: #dc3545;
      }
  
      &--has-children {
        padding-right: 24px;
      }
  
      &--active {
        background-color: #f5f5f5;
      }
    }
  
    &__item-icon {
      margin-right: 8px;
    }
  
    &__item-label {
      flex-grow: 1;
    }
  
    &__item-arrow {
      position: absolute;
      right: 8px;
    }
  }