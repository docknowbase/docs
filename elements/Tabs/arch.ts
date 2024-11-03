// src/domain/ports/TabsPort.ts
export interface TabsStatePort {
  activeTab: number;
  indicatorStyle: IndicatorStyle;
  registerTab: (index: number, element: HTMLElement) => void;
  updateIndicator: (index: number) => void;
  handleTabChange: (index: number) => void;
}

export interface IndicatorStyle {
  left?: string;
  width?: string;
}

// src/domain/models/TabsModel.ts
export interface TabsConfig {
  defaultTab: number;
  variant?: TabVariant;
  size?: TabSize;
  align?: TabAlign;
  fullWidth?: boolean;
  animated?: boolean;
  className?: string;
  onChange?: (index: number) => void;
}

export type TabVariant = "default" | "contained" | "outlined";
export type TabSize = "small" | "medium" | "large";
export type TabAlign = "start" | "center" | "end";

// src/domain/models/TabModel.ts
import { ReactNode } from "react";

export interface TabProps {
  index: number;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export interface TabPanelProps extends Omit<TabProps, "disabled"> {}

export interface TabListProps {
  children: ReactNode;
  className?: string;
}

export interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

// src/application/TabsService.ts
import { useState, useRef, RefObject } from "react";
import { TabsConfig } from "../domain/models/TabsModel";
import { IndicatorStyle, TabsStatePort } from "../domain/ports/TabsPort";

interface TabRefs {
  [key: number]: HTMLElement;
}

export const useTabsService = (config: TabsConfig): TabsStatePort => {
  const [activeTab, setActiveTab] = useState<number>(config.defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({});
  const tabsRef = useRef<TabRefs>({});

  const updateIndicator = (index: number): void => {
    if (!config.animated) return;

    const currentTab = tabsRef.current[index];
    if (currentTab) {
      const { offsetLeft, offsetWidth } = currentTab;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  };

  const handleTabChange = (index: number): void => {
    setActiveTab(index);
    config.onChange?.(index);
    updateIndicator(index);
  };

  const registerTab = (index: number, element: HTMLElement): void => {
    tabsRef.current[index] = element;
  };

  return {
    activeTab,
    indicatorStyle,
    registerTab,
    handleTabChange,
    updateIndicator,
  };
};

// src/infrastructure/adapters/TabsAdapter.tsx
import React, { createContext, useContext, ReactNode } from "react";
import classNames from "classnames";
import { TabsConfig } from "../../domain/models/TabsModel";
import { TabsStatePort } from "../../domain/ports/TabsPort";

interface TabsContextValue extends Omit<TabsStatePort, "updateIndicator"> {
  onTabChange: (index: number) => void;
}

export const TabsContext = createContext<TabsContextValue | undefined>(
  undefined
);

interface TabsProps extends TabsConfig {
  children: ReactNode;
}

export const withTabsAdapter = (
  TabsService: (config: TabsConfig) => TabsStatePort
) => {
  return function TabsAdapter({
    defaultTab = 0,
    onChange,
    children,
    variant = "default",
    size = "medium",
    align = "start",
    fullWidth = false,
    animated = true,
    className = "",
  }: TabsProps) {
    const tabsState = TabsService({
      defaultTab,
      onChange,
      animated,
      variant,
      size,
      align,
      fullWidth,
    });

    const contextValue: TabsContextValue = {
      activeTab: tabsState.activeTab,
      onTabChange: tabsState.handleTabChange,
      registerTab: tabsState.registerTab,
      indicatorStyle: tabsState.indicatorStyle,
    };

    const validChildren = React.Children.toArray(children).filter(
      (child): child is React.ReactElement =>
        React.isValidElement(child) &&
        (child.type === TabList || child.type === TabPanels)
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          className={classNames(
            "tabs",
            `tabs--${variant}`,
            `tabs--${size}`,
            `tabs--${align}`,
            {
              "tabs--full-width": fullWidth,
            },
            className
          )}
        >
          {validChildren}
        </div>
      </TabsContext.Provider>
    );
  };
};

// src/infrastructure/components/TabList.tsx
import React from "react";
import { TabListProps } from "../../domain/models/TabModel";
import { useTabsContext } from "../hooks/useTabsContext";

export const TabList: React.FC<TabListProps> = ({
  children,
  className = "",
}) => {
  const { indicatorStyle } = useTabsContext();

  return (
    <div className={classNames("tabs__header", className)}>
      <div className="tabs__list" role="tablist">
        {children}
        <div className="tabs__indicator" style={indicatorStyle} />
      </div>
    </div>
  );
};

// src/infrastructure/components/Tab.tsx
import React, { useRef, useEffect } from "react";
import { TabProps } from "../../domain/models/TabModel";
import { useTabsContext } from "../hooks/useTabsContext";

export const Tab: React.FC<TabProps> = ({
  children,
  index,
  disabled = false,
  className = "",
}) => {
  const { activeTab, onTabChange, registerTab } = useTabsContext();
  const isActive = activeTab === index;
  const tabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (tabRef.current) {
      registerTab(index, tabRef.current);
    }
  }, [index, registerTab]);

  return (
    <button
      ref={tabRef}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${index}`}
      tabIndex={isActive ? 0 : -1}
      className={classNames(
        "tabs__tab",
        {
          "tabs__tab--active": isActive,
          "tabs__tab--disabled": disabled,
        },
        className
      )}
      onClick={() => !disabled && onTabChange(index)}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// src/infrastructure/components/TabPanels.tsx
import React from "react";
import { TabPanelsProps } from "../../domain/models/TabModel";

export const TabPanels: React.FC<TabPanelsProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={classNames("tabs__panels", className)}>{children}</div>
  );
};

// src/infrastructure/components/TabPanel.tsx
import React from "react";
import { TabPanelProps } from "../../domain/models/TabModel";
import { useTabsContext } from "../hooks/useTabsContext";

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  index,
  className = "",
}) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === index;

  return (
    <div
      role="tabpanel"
      id={`panel-${index}`}
      aria-labelledby={`tab-${index}`}
      hidden={!isActive}
      className={classNames(
        "tabs__panel",
        {
          "tabs__panel--active": isActive,
        },
        className
      )}
    >
      {isActive && children}
    </div>
  );
};

// src/infrastructure/hooks/useTabsContext.ts
import { useContext } from "react";
import { TabsContext } from "../adapters/TabsAdapter";

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider");
  }
  return context;
};

// src/index.ts
import { useTabsService } from "./application/TabsService";
import { withTabsAdapter } from "./infrastructure/adapters/TabsAdapter";
import { TabList } from "./infrastructure/components/TabList";
import { Tab } from "./infrastructure/components/Tab";
import { TabPanels } from "./infrastructure/components/TabPanels";
import { TabPanel } from "./infrastructure/components/TabPanel";

const Tabs = withTabsAdapter(useTabsService);

// Export components and types
export * from "./domain/models/TabsModel";
export * from "./domain/models/TabModel";
export { Tabs as default, TabList, Tab, TabPanels, TabPanel };
