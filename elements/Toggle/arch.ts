// src/domain/models/types.ts
export type LockState = boolean;

export interface LockStateChangeEvent {
  newState: LockState;
  timestamp: number;
}

export type UnsubscribeFn = () => void;
export type StateSubscriber = (state: LockState) => void;
export type EventSubscriber = (event: LockStateChangeEvent) => void;

// src/domain/ports/LockStatePort.ts
export interface LockStatePort {
  getLockState(): Promise<LockState>;
  setLockState(state: LockState): Promise<LockState>;
  subscribeLockState(callback: StateSubscriber): UnsubscribeFn;
}

// src/domain/ports/LockEventsPort.ts
export interface LockEventsPort {
  notifyLockStateChange(event: LockStateChangeEvent): Promise<void>;
  onLockStateChange(callback: EventSubscriber): UnsubscribeFn;
}

// src/domain/LockToggleService.ts
export interface LockToggleService {
  toggleLock(currentState: LockState): Promise<LockState>;
}

export class LockToggleServiceImpl implements LockToggleService {
  constructor(
    private readonly lockStatePort: LockStatePort,
    private readonly lockEventsPort: LockEventsPort
  ) {}

  async toggleLock(currentState: LockState): Promise<LockState> {
    const newState = !currentState;
    await this.lockStatePort.setLockState(newState);
    await this.lockEventsPort.notifyLockStateChange({
      newState,
      timestamp: Date.now(),
    });
    return newState;
  }
}

// src/infrastructure/adapters/LocalStorageLockStateAdapter.ts
export class LocalStorageLockStateAdapter implements LockStatePort {
  private readonly STORAGE_KEY = "lock_toggle_state";

  async getLockState(): Promise<LockState> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  }

  async setLockState(state: LockState): Promise<LockState> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  subscribeLockState(callback: StateSubscriber): UnsubscribeFn {
    const handler = (e: StorageEvent) => {
      if (e.key === this.STORAGE_KEY && e.newValue !== null) {
        callback(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
}

// src/infrastructure/adapters/EventEmitterLockEventsAdapter.ts
export class EventEmitterLockEventsAdapter implements LockEventsPort {
  private readonly listeners: Set<EventSubscriber> = new Set();

  async notifyLockStateChange(event: LockStateChangeEvent): Promise<void> {
    this.listeners.forEach((listener) => listener(event));
  }

  onLockStateChange(callback: EventSubscriber): UnsubscribeFn {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

// src/presentation/hooks/useLockToggle.ts
import { useState, useEffect, useCallback } from "react";

interface LockToggleState {
  isLocked: LockState;
  isLoading: boolean;
  error: Error | null;
}

interface UseLockToggleResult extends LockToggleState {
  handleToggle: () => Promise<void>;
}

export const useLockToggle = (
  lockToggleService: LockToggleService,
  lockStatePort: LockStatePort,
  lockEventsPort: LockEventsPort
): UseLockToggleResult => {
  const [state, setState] = useState<LockToggleState>({
    isLocked: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initLockState = async () => {
      try {
        const lockState = await lockStatePort.getLockState();
        setState((prev) => ({
          ...prev,
          isLocked: lockState,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error("Unknown error"),
          isLoading: false,
        }));
      }
    };

    initLockState();

    const unsubscribe = lockStatePort.subscribeLockState((lockState) => {
      setState((prev) => ({
        ...prev,
        isLocked: lockState,
      }));
    });

    return unsubscribe;
  }, [lockStatePort]);

  const handleToggle = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const newState = await lockToggleService.toggleLock(state.isLocked);
      setState((prev) => ({
        ...prev,
        isLocked: newState,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Unknown error"),
        isLoading: false,
      }));
    }
  }, [state.isLocked, lockToggleService]);

  return {
    ...state,
    handleToggle,
  };
};

// src/presentation/components/LockToggle/types.ts
export interface LockToggleProps {
  isLocked: boolean;
  isLoading: boolean;
  error: Error | null;
  onToggle: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// src/presentation/components/LockToggle/index.tsx
import React from "react";
import { Lock, Unlock } from "lucide-react";
import classNames from "classnames";
import { LockToggleProps } from "./types";

export const LockToggle: React.FC<LockToggleProps> = ({
  isLocked,
  isLoading,
  error,
  onToggle,
  disabled = false,
  className = "",
}) => (
  <div className="lock-toggle-container">
    <button
      type="button"
      className={classNames(
        "lock-toggle",
        {
          "lock-toggle--locked": isLocked,
          "lock-toggle--unlocked": !isLocked,
          "lock-toggle--disabled": disabled,
          "lock-toggle--loading": isLoading,
          "lock-toggle--error": !!error,
        },
        className
      )}
      onClick={onToggle}
      disabled={disabled || isLoading}
      aria-pressed={isLocked}
    >
      <div className="lock-toggle__content">
        <span className="lock-toggle__icon">
          {isLocked ? (
            <Lock className="lock-toggle__icon-svg" />
          ) : (
            <Unlock className="lock-toggle__icon-svg" />
          )}
        </span>
        <span className="lock-toggle__text">
          {isLoading ? "Loading..." : isLocked ? "Locked" : "Unlocked"}
        </span>
      </div>
    </button>
    {error && (
      <div className="lock-toggle__error" role="alert">
        {error.message}
      </div>
    )}
  </div>
);

// src/index.tsx
import React from "react";
import { LockToggle } from "./presentation/components/LockToggle";
import { useLockToggle } from "./presentation/hooks/useLockToggle";
import { LockToggleServiceImpl } from "./domain/LockToggleService";
import { LocalStorageLockStateAdapter } from "./infrastructure/adapters/LocalStorageLockStateAdapter";
import { EventEmitterLockEventsAdapter } from "./infrastructure/adapters/EventEmitterLockEventsAdapter";

interface LockToggleContainerProps {
  disabled?: boolean;
  className?: string;
}

const LockToggleContainer: React.FC<LockToggleContainerProps> = ({
  disabled,
  className,
}) => {
  // Initialize ports and adapters
  const lockStateAdapter = new LocalStorageLockStateAdapter();
  const lockEventsAdapter = new EventEmitterLockEventsAdapter();

  // Initialize domain service
  const lockToggleService = new LockToggleServiceImpl(
    lockStateAdapter,
    lockEventsAdapter
  );

  // Use the custom hook
  const { isLocked, isLoading, error, handleToggle } = useLockToggle(
    lockToggleService,
    lockStateAdapter,
    lockEventsAdapter
  );

  return (
    <LockToggle
      isLocked={isLocked}
      isLoading={isLoading}
      error={error}
      onToggle={handleToggle}
      disabled={disabled}
      className={className}
    />
  );
};

export default LockToggleContainer;
