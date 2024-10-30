import React from "react";
import classNames from "classnames";
import "./styles.scss";

const defaultSeparator = (
  <svg
    className="breadcrumb__separator_icon"
    viewBox="0 0 24 24"
    width="16"
    height="16"
  >
    <path
      d="M9.707 18.707l6-6a.999.999 0 0 0 0-1.414l-6-6a.999.999 0 1 0-1.414 1.414L13.586 12l-5.293 5.293a.999.999 0 1 0 1.414 1.414z"
      fill="currentColor"
    />
  </svg>
);

const BreadcrumbItem = ({
  label,
  href,
  icon: Icon,
  isLast,
  onClick,
  separator = defaultSeparator,
}) => {
  const content = (
    <>
      {Icon && (
        <span className="breadcrumb__icon">
          <Icon />
        </span>
      )}
      <span className="breadcrumb__label">{label}</span>
    </>
  );

  return (
    <li
      className={classNames("breadcrumb__item", {
        "breadcrumb__item--active": isLast,
      })}
    >
      {!isLast ? (
        <>
          {href ? (
            <a
              href={href}
              className="breadcrumb__link"
              onClick={(e) => {
                if (onClick) {
                  e.preventDefault();
                  onClick();
                }
              }}
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

const Breadcrumb = ({
  items = [],
  separator,
  maxItems = 0,
  onNavigate,
  className = "",
  homeIcon = null,
}) => {
  let displayItems = [...items];

  // Handle max items truncation
  if (maxItems > 0 && items.length > maxItems) {
    const firstItem = items[0];
    const lastItems = items.slice(-Math.floor(maxItems - 1));

    displayItems = [
      firstItem,
      {
        label: "...",
        isEllipsis: true,
      },
      ...lastItems,
    ];
  }

  return (
    <nav
      aria-label="breadcrumb"
      className={classNames("breadcrumb", className)}
    >
      <ol className="breadcrumb__list">
        {displayItems.map((item, index) => (
          <BreadcrumbItem
            key={`${item.label}-${index}`}
            label={item.label}
            href={item.href}
            icon={index === 0 ? homeIcon : item.icon}
            isLast={index === displayItems.length - 1}
            onClick={() => onNavigate?.(item)}
            separator={separator}
          />
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
