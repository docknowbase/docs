import React from "react";
import classNames from "classnames";
import "./styles.scss";

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: "small" | "medium" | "large" | "xlarge";
  /** Shape variant */
  shape?: "circle" | "square" | "rounded";
  /** Status indicator */
  status?: "online" | "offline" | "busy" | "away";
  /** Whether to show status indicator */
  showStatus?: boolean;
  /** Fallback initials when image fails to load */
  initials?: string;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Whether the avatar is clickable */
  clickable?: boolean;
  /** Border style */
  bordered?: boolean;
  /** Loading state */
  loading?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  className,
  size = "medium",
  shape = "circle",
  status,
  showStatus = false,
  initials,
  onClick,
  clickable = false,
  bordered = false,
  loading = false,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = classNames(
    "avatar",
    `avatar--${size}`,
    `avatar--${shape}`,
    {
      "avatar--clickable": clickable,
      "avatar--bordered": bordered,
      "avatar--loading": loading,
      "avatar--has-image": src && !imageError,
      "avatar--has-initials": (!src || imageError) && initials,
      [className || ""]: !!className,
    }
  );

  const statusClasses = classNames(
    "avatar__status",
    status && `avatar__status--${status}`
  );

  const renderContent = () => {
    if (loading) {
      return <div className="avatar__skeleton" />;
    }

    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          className="avatar__image"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }

    if (initials) {
      return <div className="avatar__initials">{getInitials(initials)}</div>;
    }

    return (
      <div className="avatar__fallback">
        <svg
          className="avatar__fallback-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  };

  return (
    <div
      className={avatarClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="avatar__container">
        {renderContent()}
        {showStatus && status && <span className={statusClasses} />}
      </div>
    </div>
  );
};

export default Avatar;
