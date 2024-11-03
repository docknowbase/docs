// src/types/common.ts
export type Direction = "left" | "right" | null;

// src/domain/models/menu.ts
export interface MenuLink {
  label: string;
  url: string;
}

export interface MenuContent {
  id: string;
  title: string;
  description?: string;
  links?: MenuLink[];
}

export interface MenuItem {
  id: string;
  label: string;
  link: string;
  content?: MenuContent;
}

export interface MenuState {
  activeItemId: string | null;
  slideDirection: Direction;
  prevItemIndex: number | null;
}

// src/domain/ports/MenuRepository.ts
import { MenuItem } from "../models/menu";

export interface MenuRepository {
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemById(id: string): Promise<MenuItem | null>;
}

// src/domain/ports/NavigationService.ts
export interface NavigationService {
  navigate(url: string): void;
}

// src/domain/usecases/MenuInteractor.ts
import { MenuItem, MenuState } from "../models/menu";
import { MenuRepository } from "../ports/MenuRepository";
import { NavigationService } from "../ports/NavigationService";

export class MenuInteractor {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly navigationService: NavigationService
  ) {}

  public async getMenuItems(): Promise<MenuItem[]> {
    return this.menuRepository.getMenuItems();
  }

  public calculateHoverState(
    currentId: string,
    items: MenuItem[],
    prevItemIndex: number | null
  ): MenuState {
    const currentIndex: number = items.findIndex(
      (item) => item.id === currentId
    );
    const direction: Direction =
      prevItemIndex !== null && prevItemIndex < currentIndex ? "right" : "left";

    return {
      activeItemId: currentId,
      slideDirection: direction,
      prevItemIndex: currentIndex,
    };
  }

  public navigate(url: string): void {
    this.navigationService.navigate(url);
  }
}

// src/infrastructure/adapters/LocalMenuRepository.ts
import { MenuItem } from "../../domain/models/menu";
import { MenuRepository } from "../../domain/ports/MenuRepository";

export class LocalMenuRepository implements MenuRepository {
  constructor(private readonly items: MenuItem[]) {}

  public async getMenuItems(): Promise<MenuItem[]> {
    return Promise.resolve(this.items);
  }

  public async getMenuItemById(id: string): Promise<MenuItem | null> {
    const item: MenuItem | undefined = this.items.find(
      (item) => item.id === id
    );
    return Promise.resolve(item || null);
  }
}

// src/infrastructure/adapters/BrowserNavigationService.ts
import { NavigationService } from "../../domain/ports/NavigationService";

export class BrowserNavigationService implements NavigationService {
  public navigate(url: string): void {
    window.location.href = url;
  }
}

// src/presentation/hooks/useMenu.ts
import { useState, useCallback, useEffect } from "react";
import { MenuItem, MenuState } from "../../domain/models/menu";
import { MenuInteractor } from "../../domain/usecases/MenuInteractor";

interface UseMenuReturn {
  menuItems: MenuItem[];
  menuState: MenuState;
  loadMenuItems: () => Promise<void>;
  handleMouseEnter: (id: string) => void;
  handleMouseLeave: () => void;
  handleNavigation: (url: string) => void;
}

export function useMenu(menuInteractor: MenuInteractor): UseMenuReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuState, setMenuState] = useState<MenuState>({
    activeItemId: null,
    slideDirection: null,
    prevItemIndex: null,
  });

  const loadMenuItems = useCallback(async (): Promise<void> => {
    try {
      const items = await menuInteractor.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu items:", error);
    }
  }, [menuInteractor]);

  const handleMouseEnter = useCallback(
    (currentId: string): void => {
      const newState = menuInteractor.calculateHoverState(
        currentId,
        menuItems,
        menuState.prevItemIndex
      );
      setMenuState(newState);
    },
    [menuInteractor, menuItems, menuState.prevItemIndex]
  );

  const handleMouseLeave = useCallback((): void => {
    setMenuState({
      activeItemId: null,
      slideDirection: null,
      prevItemIndex: null,
    });
  }, []);

  const handleNavigation = useCallback(
    (url: string): void => {
      menuInteractor.navigate(url);
    },
    [menuInteractor]
  );

  useEffect(() => {
    void loadMenuItems();
  }, [loadMenuItems]);

  return {
    menuItems,
    menuState,
    loadMenuItems,
    handleMouseEnter,
    handleMouseLeave,
    handleNavigation,
  };
}

// src/presentation/components/MenuDropdown.tsx
import React from "react";
import { Direction } from "../../types/common";
import { MenuContent, MenuLink } from "../../domain/models/menu";
import classNames from "classnames";

interface MenuDropdownProps {
  content: MenuContent;
  isActive: boolean;
  slideDirection: Direction;
  onNavigate: (url: string) => void;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  content,
  isActive,
  slideDirection,
  onNavigate,
}) => {
  const dropdownClass = classNames("navigation-menu__dropdown", {
    "navigation-menu__dropdown--active": isActive,
    "navigation-menu__dropdown--slide-left":
      isActive && slideDirection === "left",
    "navigation-menu__dropdown--slide-right":
      isActive && slideDirection === "right",
  });

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ): void => {
    e.preventDefault();
    onNavigate(url);
  };

  return (
    <div className={dropdownClass}>
      <div className="navigation-menu__dropdown-content">
        <h3 className="navigation-menu__dropdown-title">{content.title}</h3>
        {content.description && (
          <p className="navigation-menu__dropdown-description">
            {content.description}
          </p>
        )}
        {content.links && (
          <ul className="navigation-menu__dropdown-links">
            {content.links.map((link: MenuLink, index: number) => (
              <li key={index} className="navigation-menu__dropdown-link-item">
                <a
                  href={link.url}
                  className="navigation-menu__dropdown-link"
                  onClick={(e) => handleLinkClick(e, link.url)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// src/presentation/components/MenuItem.tsx
import React from "react";
import { MenuItem as MenuItemType } from "../../domain/models/menu";
import { Direction } from "../../types/common";
import { MenuDropdown } from "./MenuDropdown";
import classNames from "classnames";

interface MenuItemProps {
  item: MenuItemType;
  isActive: boolean;
  slideDirection: Direction;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onNavigate: (url: string) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive,
  slideDirection,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}) => {
  const itemClass = classNames("navigation-menu__item", {
    "navigation-menu__item--active": isActive,
    "navigation-menu__item--slide-left": isActive && slideDirection === "left",
    "navigation-menu__item--slide-right":
      isActive && slideDirection === "right",
  });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    onNavigate(item.link);
  };

  return (
    <li
      className={itemClass}
      onMouseEnter={() => onMouseEnter(item.id)}
      onMouseLeave={onMouseLeave}
    >
      <a
        href={item.link}
        className="navigation-menu__link"
        onClick={handleLinkClick}
      >
        <span className="navigation-menu__text">{item.label}</span>
        <div className="navigation-menu__background" />
      </a>

      {item.content && (
        <MenuDropdown
          content={item.content}
          isActive={isActive}
          slideDirection={slideDirection}
          onNavigate={onNavigate}
        />
      )}
    </li>
  );
};

// src/presentation/components/MenuBar.tsx
import React from "react";
import { MenuInteractor } from "../../domain/usecases/MenuInteractor";
import { MenuItem } from "./MenuItem";
import { useMenu } from "../hooks/useMenu";
import classNames from "classnames";

interface MenuBarProps {
  menuInteractor: MenuInteractor;
  className?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  menuInteractor,
  className,
}) => {
  const {
    menuItems,
    menuState,
    handleMouseEnter,
    handleMouseLeave,
    handleNavigation,
  } = useMenu(menuInteractor);

  return (
    <nav className={classNames("navigation-menu", className)}>
      <ul className="navigation-menu__list">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={menuState.activeItemId === item.id}
            slideDirection={menuState.slideDirection}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onNavigate={handleNavigation}
          />
        ))}
      </ul>
    </nav>
  );
};

// Example usage with type-safe data
// src/example.tsx
import { MenuItem } from "./domain/models/menu";
import { MenuInteractor } from "./domain/usecases/MenuInteractor";
import { LocalMenuRepository } from "./infrastructure/adapters/LocalMenuRepository";
import { BrowserNavigationService } from "./infrastructure/adapters/BrowserNavigationService";
import { MenuBar } from "./presentation/components/MenuBar";

const menuItems: MenuItem[] = [
  {
    id: "1",
    label: "Products",
    link: "/products",
    content: {
      id: "products",
      title: "Our Products",
      description: "Explore our range of products",
      links: [
        { label: "New Arrivals", url: "/products/new" },
        { label: "Best Sellers", url: "/products/best-sellers" },
      ],
    },
  },
];

const App: React.FC = () => {
  const menuRepository = new LocalMenuRepository(menuItems);
  const navigationService = new BrowserNavigationService();
  const menuInteractor = new MenuInteractor(menuRepository, navigationService);

  return <MenuBar menuInteractor={menuInteractor} />;
};

export default App;
