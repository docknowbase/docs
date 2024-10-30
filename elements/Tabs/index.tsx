// Tabs.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import "./styles.scss";

const TabsContext = createContext();

const Tabs = ({
  defaultTab = 0,
  onChange,
  children,
  variant = "default",
  size = "medium",
  align = "start",
  fullWidth = false,
  animated = true,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef({});
  const tabListRef = useRef(null);

  const updateIndicator = (index) => {
    if (!animated) return;

    const currentTab = tabsRef.current[index];
    if (currentTab) {
      const { offsetLeft, offsetWidth } = currentTab;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  const contextValue = {
    activeTab,
    onTabChange: handleTabChange,
    registerTab: (index, element) => {
      tabsRef.current[index] = element;
    },
  };

  const validChildren = React.Children.toArray(children).filter(
    (child) =>
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

const TabList = ({ children, className = "" }) => {
  const tabListRef = useRef(null);
  const { indicatorStyle } = useContext(TabsContext);

  return (
    <div className={classNames("tabs__header", className)} ref={tabListRef}>
      <div className="tabs__list" role="tablist">
        {children}
        <div className="tabs__indicator" style={indicatorStyle} />
      </div>
    </div>
  );
};

const Tab = ({ children, index, disabled = false, className = "" }) => {
  const { activeTab, onTabChange, registerTab } = useContext(TabsContext);
  const isActive = activeTab === index;
  const tabRef = useRef(null);

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

const TabPanels = ({ children, className = "" }) => {
  return (
    <div className={classNames("tabs__panels", className)}>{children}</div>
  );
};

const TabPanel = ({ children, index, className = "" }) => {
  const { activeTab } = useContext(TabsContext);
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

Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanels = TabPanels;
Tabs.TabPanel = TabPanel;

export default Tabs;
