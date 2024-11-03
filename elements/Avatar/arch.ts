// src/domain/types/avatar.types.ts
export type AvatarSize = "small" | "medium" | "large" | "xlarge";
export type AvatarShape = "circle" | "square" | "rounded";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarState {
  imageError: boolean;
  isLoaded: boolean;
}

export interface AvatarConfig {
  src?: string;
  alt?: string;
  className?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  showStatus?: boolean;
  initials?: string;
  clickable?: boolean;
  bordered?: boolean;
  loading?: boolean;
}

// src/domain/ports/avatar.ports.ts
import { AvatarConfig, AvatarState } from "../types/avatar.types";

export interface AvatarStylePort {
  getAvatarClassNames(config: AvatarConfig, className?: string): string;
  getStatusClassNames(status?: AvatarStatus): string;
}

export interface AvatarImagePort {
  handleImageError(): void;
  handleImageLoad(): void;
  getInitials(text: string): string;
}

export interface SetAvatarState {
  (
    state:
      | Partial<AvatarState>
      | ((prevState: AvatarState) => Partial<AvatarState>)
  ): void;
}

// src/domain/services/avatar.service.ts
import { AvatarStylePort, AvatarImagePort } from "../ports/avatar.ports";
import { AvatarConfig, AvatarStatus } from "../types/avatar.types";

export class AvatarService {
  constructor(
    private readonly stylePort: AvatarStylePort,
    private readonly imagePort: AvatarImagePort
  ) {}

  public getAvatarClassNames(config: AvatarConfig, className?: string): string {
    return this.stylePort.getAvatarClassNames(config, className);
  }

  public getStatusClassNames(status?: AvatarStatus): string {
    return this.stylePort.getStatusClassNames(status);
  }

  public handleImageError(): void {
    this.imagePort.handleImageError();
  }

  public handleImageLoad(): void {
    this.imagePort.handleImageLoad();
  }

  public getInitials(text: string): string {
    return this.imagePort.getInitials(text);
  }
}

// src/infrastructure/adapters/avatar-style.adapter.ts
import classNames from "classnames";
import { AvatarStylePort } from "../../domain/ports/avatar.ports";
import { AvatarConfig, AvatarStatus } from "../../domain/types/avatar.types";

export class AvatarStyleAdapter implements AvatarStylePort {
  public getAvatarClassNames(config: AvatarConfig, className?: string): string {
    const { size, shape, clickable, bordered, loading, src, initials } = config;

    return classNames("avatar", `avatar--${size}`, `avatar--${shape}`, {
      "avatar--clickable": clickable,
      "avatar--bordered": bordered,
      "avatar--loading": loading,
      "avatar--has-image": src && !loading,
      "avatar--has-initials": (!src || loading) && initials,
      [className || ""]: !!className,
    });
  }

  public getStatusClassNames(status?: AvatarStatus): string {
    return classNames("avatar__status", status && `avatar__status--${status}`);
  }
}

// src/infrastructure/adapters/avatar-image.adapter.ts
import {
  AvatarImagePort,
  SetAvatarState,
} from "../../domain/ports/avatar.ports";

export class AvatarImageAdapter implements AvatarImagePort {
  constructor(private readonly setState: SetAvatarState) {}

  public handleImageError(): void {
    this.setState({ imageError: true });
  }

  public handleImageLoad(): void {
    this.setState({ isLoaded: true });
  }

  public getInitials(text: string): string {
    return text
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
}

// src/presentation/components/Avatar/AvatarContent.tsx
import React from "react";
import { AvatarConfig } from "../../../domain/types/avatar.types";

interface AvatarContentProps extends AvatarConfig {
  imageError: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
  getInitials: (text: string) => string;
}

export const AvatarContent: React.FC<AvatarContentProps> = ({
  loading,
  src,
  alt,
  imageError,
  onImageError,
  onImageLoad,
  initials,
  getInitials,
}): JSX.Element => {
  if (loading) {
    return <div className="avatar__skeleton" />;
  }

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        className="avatar__image"
        onError={onImageError}
        onLoad={onImageLoad}
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

// src/presentation/components/Avatar/Avatar.tsx
import React from "react";
import { AvatarService } from "../../../domain/services/avatar.service";
import { AvatarStyleAdapter } from "../../../infrastructure/adapters/avatar-style.adapter";
import { AvatarImageAdapter } from "../../../infrastructure/adapters/avatar-image.adapter";
import { AvatarContent } from "./AvatarContent";
import { AvatarConfig, AvatarState } from "../../../domain/types/avatar.types";

interface AvatarProps extends AvatarConfig {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
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
}): JSX.Element => {
  const [state, setState] = React.useState<AvatarState>({
    imageError: false,
    isLoaded: false,
  });

  const styleAdapter = React.useMemo(() => new AvatarStyleAdapter(), []);
  const imageAdapter = React.useMemo(
    () => new AvatarImageAdapter(setState),
    []
  );
  const avatarService = React.useMemo(
    () => new AvatarService(styleAdapter, imageAdapter),
    [styleAdapter, imageAdapter]
  );

  const config: AvatarConfig = {
    src,
    alt,
    size,
    shape,
    status,
    showStatus,
    initials,
    clickable,
    bordered,
    loading,
  };

  const avatarClasses = avatarService.getAvatarClassNames(config, className);
  const statusClasses = avatarService.getStatusClassNames(status);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (clickable && onClick) {
        onClick(event);
      }
    },
    [clickable, onClick]
  );

  return (
    <div
      className={avatarClasses}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="avatar__container">
        <AvatarContent
          {...config}
          imageError={state.imageError}
          onImageError={() => avatarService.handleImageError()}
          onImageLoad={() => avatarService.handleImageLoad()}
          getInitials={(text) => avatarService.getInitials(text)}
        />
        {showStatus && status && <span className={statusClasses} />}
      </div>
    </div>
  );
};

// src/presentation/components/Avatar/index.ts
export { Avatar } from "./Avatar";
export type { AvatarProps } from "./Avatar";
export type {
  AvatarConfig,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
} from "../../../domain/types/avatar.types";

// Optional: src/presentation/hooks/useAvatarService.ts
import { useMemo } from "react";
import { AvatarService } from "../../domain/services/avatar.service";
import { AvatarStyleAdapter } from "../../infrastructure/adapters/avatar-style.adapter";
import { AvatarImageAdapter } from "../../infrastructure/adapters/avatar-image.adapter";
import { SetAvatarState } from "../../domain/ports/avatar.ports";

export const useAvatarService = (setState: SetAvatarState) => {
  const styleAdapter = useMemo(() => new AvatarStyleAdapter(), []);
  const imageAdapter = useMemo(
    () => new AvatarImageAdapter(setState),
    [setState]
  );

  return useMemo(
    () => new AvatarService(styleAdapter, imageAdapter),
    [styleAdapter, imageAdapter]
  );
};
