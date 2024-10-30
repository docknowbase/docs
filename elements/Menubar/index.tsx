import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";
import "./styles.scss";

interface MenuOption {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  children?: MenuOption[];
  onClick?: () => void;
}

interface MenuBarProps {
  items: MenuOption[];
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

interface ActiveMenu {
  id: string;
  level: number;
  position: Position;
}

const SubMenu: React.FC<{
  options: MenuOption[];
  position: Position;
  level: number;
  parentId: string;
  activeMenus: ActiveMenu[];
  onMenuActivate: (menu: ActiveMenu | null) => void;
  onMenuSelect: () => void;
}> = ({
  options,
  position,
  level,
  parentId,
  activeMenus,
  onMenuActivate,
  onMenuSelect,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuDimensions, setMenuDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (menuRef.current) {
      setMenuDimensions({
        width: menuRef.current.offsetWidth,
        height: menuRef.current.offsetHeight,
      });
    }
  }, [options]);

  const calculateSubMenuPosition = useCallback(
    (parentPos: Position, itemHeight: number, index: number): Position => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let x = parentPos.x;
      let y = parentPos.y + index * itemHeight;

      if (level > 0) {
        x = parentPos.x + menuDimensions.width - 2;
        y = parentPos.y + index * itemHeight - itemHeight * index;
      }

      // Check boundaries and adjust if needed
      if (x + menuDimensions.width > viewport.width) {
        x = level === 0 ? x : parentPos.x - menuDimensions.width + 2;
      }

      if (y + menuDimensions.height > viewport.height) {
        y = viewport.height - menuDimensions.height - 4;
      }

      return { x, y };
    },
    [level, menuDimensions]
  );

  const handleMouseEnter = (option: MenuOption, index: number) => {
    if (option.disabled) return;

    const newPosition = calculateSubMenuPosition(position, 28, index);
    if (option.children) {
      onMenuActivate({
        id: option.id,
        level: level + 1,
        position: newPosition,
      });
    }
  };

  const handleClick = (option: MenuOption, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!option.disabled && !option.children && option.onClick) {
      option.onClick();
      onMenuSelect();
    }
  };

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
              "menu-bar__item--has-children": option.children,
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
              {option.children && (
                <span className="menu-bar__item-arrow">›</span>
              )}
            </div>

            {isActive && option.children && (
              <SubMenu
                options={option.children}
                position={
                  activeMenus.find((menu) => menu.id === option.id)?.position ||
                  position
                }
                level={level + 1}
                parentId={option.id}
                activeMenus={activeMenus}
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

const MenuBar: React.FC<MenuBarProps> = ({ items, className }) => {
  const [activeMenus, setActiveMenus] = useState<ActiveMenu[]>([]);
  const [activeRootMenu, setActiveRootMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const handleRootMouseEnter = (item: MenuOption) => {
    if (activeRootMenu !== null) {
      handleItemClick(item);
    }
  };

  const calculateInitialPosition = (index: number): Position => {
    if (!menuBarRef.current) return { x: 0, y: 0 };

    const menuBarRect = menuBarRef.current.getBoundingClientRect();
    const menuItems = menuBarRef.current.getElementsByClassName(
      "menu-bar__root-item"
    );
    const itemRect = menuItems[index].getBoundingClientRect();

    return {
      x: itemRect.left,
      y: menuBarRect.bottom,
    };
  };

  const handleItemClick = (item: MenuOption, index?: number) => {
    if (item.disabled) return;

    if (activeRootMenu === item.id) {
      setActiveRootMenu(null);
      setActiveMenus([]);
      return;
    }

    if (item.children) {
      setActiveRootMenu(item.id);
      setActiveMenus([
        {
          id: item.id,
          level: 0,
          position: calculateInitialPosition(index || 0),
        },
      ]);
    } else if (item.onClick) {
      item.onClick();
      setActiveRootMenu(null);
      setActiveMenus([]);
    }
  };

  const handleMenuActivate = (menu: ActiveMenu | null) => {
    if (!menu) {
      setActiveMenus([]);
      return;
    }

    setActiveMenus((prev) => {
      const filtered = prev.filter((m) => m.level < menu.level);
      return [...filtered, menu];
    });
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      menuBarRef.current &&
      !menuBarRef.current.contains(event.target as Node)
    ) {
      setActiveRootMenu(null);
      setActiveMenus([]);
    }
  }, []);

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
              "menu-bar__root-item--active": activeRootMenu === item.id,
              "menu-bar__root-item--disabled": item.disabled,
            })}
            onClick={() => handleItemClick(item, index)}
            onMouseEnter={() => handleRootMouseEnter(item)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {activeRootMenu && activeMenus.length > 0 && (
        <SubMenu
          options={
            items.find((item) => item.id === activeRootMenu)?.children || []
          }
          position={activeMenus[0].position}
          level={0}
          parentId={activeRootMenu}
          activeMenus={activeMenus}
          onMenuActivate={handleMenuActivate}
          onMenuSelect={() => {
            setActiveRootMenu(null);
            setActiveMenus([]);
          }}
        />
      )}
    </div>
  );
};

export default MenuBar;
