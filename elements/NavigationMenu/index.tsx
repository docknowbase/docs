import React, { useState } from "react";
import classNames from "classnames";
import "./styles.scss";

interface MenuContent {
  id: string;
  title: string;
  description?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}

interface MenuItem {
  id: string;
  label: string;
  link: string;
  content?: MenuContent;
}

interface MenuBarProps {
  items: MenuItem[];
  className?: string;
}

interface HoverState {
  itemId: string | null;
  direction: "left" | "right" | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ items, className }) => {
  const [hoverState, setHoverState] = useState<HoverState>({
    itemId: null,
    direction: null,
  });
  const [prevItemIndex, setPrevItemIndex] = useState<number | null>(null);

  const handleMouseEnter = (
    currentId: string,
    event: React.MouseEvent<HTMLLIElement>
  ) => {
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const direction =
      prevItemIndex !== null && prevItemIndex < currentIndex ? "right" : "left";

    setPrevItemIndex(currentIndex);
    setHoverState({ itemId: currentId, direction });
  };

  const handleMouseLeave = () => {
    setHoverState({ itemId: null, direction: null });
  };

  return (
    <nav className={classNames("navigation-menu", className)}>
      <ul className="navigation-menu__list">
        {items.map((item) => {
          const isActive = hoverState.itemId === item.id;
          const slideDirection = hoverState.direction;

          return (
            <li
              key={item.id}
              className={classNames("navigation-menu__item", {
                "navigation-menu__item--active": isActive,
                "navigation-menu__item--slide-left":
                  isActive && slideDirection === "left",
                "navigation-menu__item--slide-right":
                  isActive && slideDirection === "right",
              })}
              onMouseEnter={(e) => handleMouseEnter(item.id, e)}
              onMouseLeave={handleMouseLeave}
            >
              <a href={item.link} className="navigation-menu__link">
                <span className="navigation-menu__text">{item.label}</span>
                <div className="navigation-menu__background" />
              </a>

              {item.content && (
                <div
                  className={classNames("navigation-menu__dropdown", {
                    "navigation-menu__dropdown--active": isActive,
                    "navigation-menu__dropdown--slide-left":
                      isActive && slideDirection === "left",
                    "navigation-menu__dropdown--slide-right":
                      isActive && slideDirection === "right",
                  })}
                >
                  <div className="navigation-menu__dropdown-content">
                    <h3 className="navigation-menu__dropdown-title">
                      {item.content.title}
                    </h3>
                    {item.content.description && (
                      <p className="navigation-menu__dropdown-description">
                        {item.content.description}
                      </p>
                    )}
                    {item.content.links && (
                      <ul className="navigation-menu__dropdown-links">
                        {item.content.links.map((link, index) => (
                          <li
                            key={index}
                            className="navigation-menu__dropdown-link-item"
                          >
                            <a
                              href={link.url}
                              className="navigation-menu__dropdown-link"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MenuBar;
