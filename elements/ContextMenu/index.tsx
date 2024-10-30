import React, { useState, useEffect, useCallback, useRef } from "react";
import classNames from "classnames";
import "./styles.scss";

interface MenuOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  children?: MenuOption[];
  onClick?: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface ContextMenuProps {
  options: MenuOption[];
  onClose: () => void;
  position: Position;
  className?: string;
}

interface SubMenuProps extends ContextMenuProps {
  parentWidth: number;
  level: number;
}

const MENU_ITEM_HEIGHT = 32;
const MENU_PADDING = 8;

const SubMenu: React.FC<SubMenuProps> = ({
  options,
  position,
  onClose,
  className,
  parentWidth,
  level,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
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
    (parentPosition: Position, index: number): Position => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const subMenuVerticalPosition =
        position.y + index * MENU_ITEM_HEIGHT - MENU_PADDING;

      // Check if there's space on the right
      const spaceOnRight =
        viewport.width - (position.x + parentWidth + menuDimensions.width);

      // If not enough space on right, show on left
      const x =
        spaceOnRight > 0
          ? position.x + parentWidth - MENU_PADDING
          : position.x - menuDimensions.width + MENU_PADDING;

      // Adjust vertical position if menu would go below viewport
      let y = subMenuVerticalPosition;
      if (y + menuDimensions.height > viewport.height) {
        y = viewport.height - menuDimensions.height - MENU_PADDING;
      }

      return { x, y };
    },
    [menuDimensions, position, parentWidth]
  );

  const handleMouseEnter = (optionId: string, index: number) => {
    const option = options.find((opt) => opt.id === optionId);
    if (option?.children) {
      setActiveSubmenu(optionId);
    }
  };

  const handleMouseLeave = () => {
    setActiveSubmenu(null);
  };

  const handleClick = (option: MenuOption, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!option.children && !option.disabled && option.onClick) {
      option.onClick();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className={classNames(
        "context-menu",
        `context-menu--level-${level}`,
        className
      )}
      style={{ left: position.x, top: position.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {options.map((option, index) => (
        <div
          key={option.id}
          className={classNames("context-menu__item", {
            "context-menu__item--disabled": option.disabled,
            "context-menu__item--danger": option.danger,
            "context-menu__item--has-children": option.children,
            "context-menu__item--active": activeSubmenu === option.id,
          })}
          onMouseEnter={() => handleMouseEnter(option.id, index)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => handleClick(option, e)}
        >
          {option.icon && (
            <span className="context-menu__item-icon">{option.icon}</span>
          )}
          <span className="context-menu__item-label">{option.label}</span>
          {option.children && (
            <span className="context-menu__item-arrow">›</span>
          )}

          {activeSubmenu === option.id && option.children && (
            <SubMenu
              options={option.children}
              position={calculateSubMenuPosition(position, index)}
              onClose={onClose}
              parentWidth={menuDimensions.width}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const ContextMenu: React.FC<ContextMenuProps> = ({
  options,
  position,
  onClose,
  className,
}) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !event.target.closest(".context-menu")
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [onClose]);

  return (
    <SubMenu
      options={options}
      position={position}
      onClose={onClose}
      parentWidth={0}
      level={0}
      className={className}
    />
  );
};

export default ContextMenu;
