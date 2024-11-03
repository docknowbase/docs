// src/domain/models/types.ts
export type Icon = React.ComponentType<{ className?: string }>;

export interface BreadcrumbItemEntity {
  id: string;
  label: string;
  href?: string;
  icon?: Icon;
  isEllipsis?: boolean;
}

// src/domain/ports/repositories.ts
export interface BreadcrumbRepository {
  getItems(): Promise<BreadcrumbItemEntity[]>;
  saveNavigationHistory(item: BreadcrumbItemEntity): Promise<void>;
  clearHistory(): Promise<void>;
}

// src/domain/ports/services.ts
export interface NavigationService {
  navigate(path: string): Promise<void>;
  getCurrentPath(): string;
  getPathSegments(): string[];
}

// src/domain/usecases/breadcrumb.ts
export interface BreadcrumbUseCase {
  getProcessedItems(): Promise<BreadcrumbItemEntity[]>;
  processNewNavigation(item: BreadcrumbItemEntity): Promise<void>;
}

export class BreadcrumbInteractor implements BreadcrumbUseCase {
  constructor(
    private readonly repository: BreadcrumbRepository,
    private readonly navigationService: NavigationService,
    private readonly maxItems: number = 0
  ) {}

  private processItems(items: BreadcrumbItemEntity[]): BreadcrumbItemEntity[] {
    if (this.maxItems > 0 && items.length > this.maxItems) {
      const firstItem = items[0];
      const lastItems = items.slice(-Math.floor(this.maxItems - 1));

      return [
        firstItem,
        { id: "ellipsis", label: "...", isEllipsis: true },
        ...lastItems,
      ];
    }
    return items;
  }

  async getProcessedItems(): Promise<BreadcrumbItemEntity[]> {
    const items = await this.repository.getItems();
    return this.processItems(items);
  }

  async processNewNavigation(item: BreadcrumbItemEntity): Promise<void> {
    if (item.href) {
      await this.navigationService.navigate(item.href);
      await this.repository.saveNavigationHistory(item);
    }
  }
}

// src/infrastructure/adapters/LocalStorageBreadcrumbRepository.ts
export class LocalStorageBreadcrumbRepository implements BreadcrumbRepository {
  private readonly storageKey: string = "breadcrumb_history";

  async getItems(): Promise<BreadcrumbItemEntity[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error retrieving breadcrumb history:", error);
      return [];
    }
  }

  async saveNavigationHistory(item: BreadcrumbItemEntity): Promise<void> {
    try {
      const items = await this.getItems();
      items.push(item);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving breadcrumb history:", error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Error clearing breadcrumb history:", error);
    }
  }
}

// src/infrastructure/adapters/BrowserNavigationService.ts
export class BrowserNavigationService implements NavigationService {
  async navigate(path: string): Promise<void> {
    try {
      window.history.pushState({}, "", path);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }

  getCurrentPath(): string {
    return window.location.pathname;
  }

  getPathSegments(): string[] {
    return this.getCurrentPath()
      .split("/")
      .filter((segment) => segment.length > 0);
  }
}

// src/presentation/components/BreadcrumbItem.tsx
import React from "react";
import { BreadcrumbItemEntity } from "../../domain/models/types";

interface BreadcrumbItemProps {
  item: BreadcrumbItemEntity;
  isLast: boolean;
  separator?: React.ReactNode;
  onNavigate?: (item: BreadcrumbItemEntity) => void;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  item,
  isLast,
  separator,
  onNavigate,
}) => {
  const Icon = item.icon;

  const content = React.useMemo(
    () => (
      <>
        {Icon && (
          <span className="breadcrumb__icon">
            <Icon className="breadcrumb__icon-svg" />
          </span>
        )}
        <span className="breadcrumb__label">{item.label}</span>
      </>
    ),
    [Icon, item.label]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(item);
      }
    },
    [item, onNavigate]
  );

  return (
    <li
      className={`breadcrumb__item ${isLast ? "breadcrumb__item--active" : ""}`}
      data-testid={`breadcrumb-item-${item.id}`}
    >
      {!isLast ? (
        <>
          {item.href ? (
            <a
              href={item.href}
              className="breadcrumb__link"
              onClick={handleClick}
              data-testid={`breadcrumb-link-${item.id}`}
            >
              {content}
            </a>
          ) : (
            <span className="breadcrumb__text">{content}</span>
          )}
          <span className="breadcrumb__separator">{separator}</span>
        </>
      ) : (
        <span className="breadcrumb__text">{content}</span>
      )}
    </li>
  );
};

// src/presentation/components/Breadcrumb.tsx
import React from "react";
import { BreadcrumbItemEntity, Icon } from "../../domain/models/types";
import { BreadcrumbUseCase } from "../../domain/usecases/breadcrumb";
import { BreadcrumbItem } from "./BreadcrumbItem";

interface BreadcrumbProps {
  useCase: BreadcrumbUseCase;
  maxItems?: number;
  separator?: React.ReactNode;
  className?: string;
  homeIcon?: Icon;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  useCase,
  maxItems = 0,
  separator,
  className = "",
  homeIcon,
}) => {
  const [items, setItems] = React.useState<BreadcrumbItemEntity[]>([]);

  React.useEffect(() => {
    const loadItems = async () => {
      try {
        const processedItems = await useCase.getProcessedItems();
        setItems(processedItems);
      } catch (error) {
        console.error("Error loading breadcrumb items:", error);
      }
    };

    loadItems();
  }, [useCase]);

  const handleNavigate = React.useCallback(
    async (item: BreadcrumbItemEntity) => {
      try {
        await useCase.processNewNavigation(item);
        const updatedItems = await useCase.getProcessedItems();
        setItems(updatedItems);
      } catch (error) {
        console.error("Error processing navigation:", error);
      }
    },
    [useCase]
  );

  return (
    <nav
      aria-label="breadcrumb"
      className={`breadcrumb ${className}`.trim()}
      data-testid="breadcrumb-nav"
    >
      <ol className="breadcrumb__list">
        {items.map((item, index) => (
          <BreadcrumbItem
            key={item.id}
            item={{
              ...item,
              icon: index === 0 ? homeIcon : item.icon,
            }}
            isLast={index === items.length - 1}
            separator={separator}
            onNavigate={handleNavigate}
          />
        ))}
      </ol>
    </nav>
  );
};

// src/hooks/useBreadcrumb.ts
import { useCallback, useEffect, useState } from "react";
import { BreadcrumbItemEntity } from "../domain/models/types";
import { BreadcrumbUseCase } from "../domain/usecases/breadcrumb";

interface UseBreadcrumbResult {
  items: BreadcrumbItemEntity[];
  isLoading: boolean;
  error: Error | null;
  navigate: (item: BreadcrumbItemEntity) => Promise<void>;
}

export const useBreadcrumb = (
  useCase: BreadcrumbUseCase
): UseBreadcrumbResult => {
  const [items, setItems] = useState<BreadcrumbItemEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const processedItems = await useCase.getProcessedItems();
      setItems(processedItems);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  }, [useCase]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const navigate = useCallback(
    async (item: BreadcrumbItemEntity) => {
      try {
        await useCase.processNewNavigation(item);
        await loadItems();
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Navigation failed"));
        throw err;
      }
    },
    [useCase, loadItems]
  );

  return { items, isLoading, error, navigate };
};

// Example usage
// src/App.tsx
import React from "react";
import { BreadcrumbInteractor } from "./domain/usecases/breadcrumb";
import { LocalStorageBreadcrumbRepository } from "./infrastructure/adapters/LocalStorageBreadcrumbRepository";
import { BrowserNavigationService } from "./infrastructure/adapters/BrowserNavigationService";
import { Breadcrumb } from "./presentation/components/Breadcrumb";
import { HomeIcon } from "./presentation/icons/HomeIcon"; // You would need to implement this

export const App: React.FC = () => {
  const repository = new LocalStorageBreadcrumbRepository();
  const navigationService = new BrowserNavigationService();
  const useCase = new BreadcrumbInteractor(repository, navigationService, 5);

  return (
    <div className="app">
      <Breadcrumb
        useCase={useCase}
        maxItems={5}
        homeIcon={HomeIcon}
        className="app__breadcrumb"
      />
    </div>
  );
};
