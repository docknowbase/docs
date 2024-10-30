// src/components/FormatToggleGroup/index.jsx
import React, { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import classNames from "classnames";
import "./styles.scss";

const FormatToggleGroup = ({
  onChange,
  initialStates = {
    bold: false,
    italic: false,
    underline: false,
  },
}) => {
  const [formats, setFormats] = useState(initialStates);

  const handleToggle = (format) => {
    const newFormats = {
      ...formats,
      [format]: !formats[format],
    };
    setFormats(newFormats);
    onChange?.(newFormats);
  };

  const formatButtons = [
    { id: "bold", Icon: Bold, label: "Bold" },
    { id: "italic", Icon: Italic, label: "Italic" },
    { id: "underline", Icon: Underline, label: "Underline" },
  ];

  return (
    <div className="format-group">
      <div className="format-group__container">
        {formatButtons.map(({ id, Icon, label }) => (
          <button
            key={id}
            type="button"
            className={classNames("format-group__button", {
              "format-group__button--active": formats[id],
            })}
            onClick={() => handleToggle(id)}
            aria-pressed={formats[id]}
            aria-label={label}
          >
            <span className="format-group__icon-wrapper">
              <Icon className="format-group__icon" />
            </span>
            <span className="format-group__tooltip">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormatToggleGroup;
