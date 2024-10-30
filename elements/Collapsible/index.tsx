// src/components/ExpandablePanel/index.jsx
import React, { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";
import "./styles.scss";

const ExpandablePanel = ({
  title,
  children,
  isInitiallyExpanded = false,
  icon = null,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const contentRef = useRef(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={classNames("expandable", className)}>
      <button
        className={classNames("expandable__header", {
          "expandable__header--expanded": isExpanded,
        })}
        onClick={toggleExpand}
        aria-expanded={isExpanded}
      >
        <div className="expandable__header-content">
          {icon && <span className="expandable__icon">{icon}</span>}
          <span className="expandable__title">{title}</span>
        </div>
        <ChevronDown
          className={classNames("expandable__arrow", {
            "expandable__arrow--expanded": isExpanded,
          })}
          size={20}
        />
      </button>

      <div
        ref={contentRef}
        className={classNames("expandable__content", {
          "expandable__content--expanded": isExpanded,
        })}
        style={{
          "--content-height": contentRef.current
            ? `${contentRef.current.scrollHeight}px`
            : "0px",
        }}
      >
        <div className="expandable__content-inner">{children}</div>
      </div>
    </div>
  );
};

export default ExpandablePanel;
