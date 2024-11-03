// src/domain/pagination/types.ts
export interface PaginationParams {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  siblingCount: number;
}

export interface PaginationState {
  currentPage: number;
  disabled: boolean;
}

export type PaginationRange = (number | "dots")[];

// src/domain/pagination/PaginationEntity.ts
export class PaginationEntity {
  private currentPage: number;
  private totalPages: number;
  private pageSize: number;
  private siblingCount: number;

  constructor({
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    siblingCount = 1,
  }: Partial<PaginationParams>) {
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.pageSize = pageSize;
    this.siblingCount = siblingCount;
  }

  canGoToNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  canGoToPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  getNextPage(): number {
    return Math.min(this.currentPage + 1, this.totalPages);
  }

  getPreviousPage(): number {
    return Math.max(this.currentPage - 1, 1);
  }

  calculatePaginationRange(): PaginationRange {
    const totalNumbers = this.siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (this.totalPages <= totalBlocks) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(this.currentPage - this.siblingCount, 1);
    const rightSiblingIndex = Math.min(
      this.currentPage + this.siblingCount,
      this.totalPages
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < this.totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * this.siblingCount;
      return [
        ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
        "dots",
        this.totalPages,
      ];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * this.siblingCount;
      return [
        1,
        "dots",
        ...Array.from(
          { length: rightItemCount },
          (_, i) => this.totalPages - rightItemCount + i + 1
        ),
      ];
    }

    return [
      1,
      "dots",
      ...Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      ),
      "dots",
      this.totalPages,
    ];
  }
}

// src/domain/pagination/ports/PaginationPort.ts
export interface PaginationPort {
  calculatePaginationRange(params: PaginationParams): PaginationRange;
  onPageChange(page: number): void;
  onPageSizeChange(size: number): void;
}

// src/domain/pagination/usecases/PaginationUseCase.ts
export class PaginationUseCase {
  constructor(private paginationPort: PaginationPort) {}

  getPaginationRange(params: PaginationParams): PaginationRange {
    const paginationEntity = new PaginationEntity(params);
    return paginationEntity.calculatePaginationRange();
  }

  handlePageChange(newPage: number, currentState: PaginationState): void {
    if (newPage !== currentState.currentPage && !currentState.disabled) {
      this.paginationPort.onPageChange(newPage);
    }
  }

  handlePageSizeChange(
    newSize: number,
    currentState: Pick<PaginationState, "disabled">
  ): void {
    if (!currentState.disabled) {
      this.paginationPort.onPageSizeChange(Number(newSize));
    }
  }
}

// src/infrastructure/adapters/PaginationAdapter.ts
export class PaginationAdapter implements PaginationPort {
  constructor(
    private onPageChangeHandler: (page: number) => void,
    private onPageSizeChangeHandler: (size: number) => void
  ) {}

  calculatePaginationRange(params: PaginationParams): PaginationRange {
    const paginationEntity = new PaginationEntity(params);
    return paginationEntity.calculatePaginationRange();
  }

  onPageChange(page: number): void {
    this.onPageChangeHandler(page);
  }

  onPageSizeChange(size: number): void {
    this.onPageSizeChangeHandler(size);
  }
}

// src/presentation/hooks/usePagination.ts
import { useMemo } from "react";
import { PaginationUseCase } from "../../domain/pagination/usecases/PaginationUseCase";
import { PaginationAdapter } from "../../infrastructure/adapters/PaginationAdapter";
import { PaginationRange } from "../../domain/pagination/types";

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  siblingCount: number;
  disabled: boolean;
}

interface UsePaginationResult {
  paginationRange: PaginationRange;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
}

export const usePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  siblingCount,
  disabled,
}: UsePaginationProps): UsePaginationResult => {
  const paginationAdapter = useMemo(
    () => new PaginationAdapter(onPageChange, onPageSizeChange),
    [onPageChange, onPageSizeChange]
  );

  const paginationUseCase = useMemo(
    () => new PaginationUseCase(paginationAdapter),
    [paginationAdapter]
  );

  const paginationRange = useMemo(
    () =>
      paginationUseCase.getPaginationRange({
        currentPage,
        totalPages,
        pageSize: 10, // Default value
        siblingCount,
      }),
    [currentPage, totalPages, siblingCount, paginationUseCase]
  );

  const handlePageChange = (page: number): void => {
    paginationUseCase.handlePageChange(page, { currentPage, disabled });
  };

  const handlePageSizeChange = (size: number): void => {
    paginationUseCase.handlePageSizeChange(size, { disabled });
  };

  return {
    paginationRange,
    handlePageChange,
    handlePageSizeChange,
  };
};

// src/presentation/components/Pagination/PaginationButton.tsx
import React from "react";
import classNames from "classnames";

interface PaginationButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  page: number;
  isActive: boolean;
  disabled: boolean;
  onClick: (page: number) => void;
}

export const PaginationButton: React.FC<PaginationButtonProps> = ({
  page,
  isActive,
  disabled,
  onClick,
  className,
  children,
  ...props
}) => (
  <button
    className={classNames("pagination__button", className, {
      "pagination__button--active": isActive,
      "pagination__button--disabled": disabled,
    })}
    onClick={() => onClick(page)}
    disabled={disabled}
    aria-current={isActive ? "page" : undefined}
    {...props}
  >
    {children}
  </button>
);

// src/presentation/components/Pagination/PaginationNav.tsx
import React from "react";
import classNames from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationNavProps {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  double?: boolean;
}

export const PaginationNav: React.FC<PaginationNavProps> = ({
  direction = "left",
  disabled,
  onClick,
  double = false,
}) => {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      className={classNames("pagination__nav", {
        "pagination__nav--disabled": disabled,
      })}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === "left" ? "Previous" : "Next"} page`}
    >
      <Icon size={18} />
      {double && <Icon size={18} className="pagination__nav-double" />}
    </button>
  );
};

// src/presentation/components/Pagination/index.tsx
import React from "react";
import classNames from "classnames";
import { MoreHorizontal } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationButton } from "./PaginationButton";
import { PaginationNav } from "./PaginationNav";
import "./styles.scss";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  showFirstLast?: boolean;
  showPageSize?: boolean;
  pageSize?: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = "",
  showFirstLast = true,
  showPageSize = true,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
}) => {
  const { paginationRange, handlePageChange, handlePageSizeChange } =
    usePagination({
      currentPage,
      totalPages,
      onPageChange,
      onPageSizeChange,
      siblingCount,
      disabled,
    });

  const renderPageButton = (pageNumber: number | "dots", index: number) => {
    if (pageNumber === "dots") {
      return (
        <span key={`dots-${index}`} className="pagination__dots">
          <MoreHorizontal size={18} />
        </span>
      );
    }

    return (
      <PaginationButton
        key={pageNumber}
        page={pageNumber}
        isActive={pageNumber === currentPage}
        disabled={disabled}
        onClick={handlePageChange}
      >
        {pageNumber}
      </PaginationButton>
    );
  };

  return (
    <div className={classNames("pagination", className)}>
      <div className="pagination__controls">
        <div className="pagination__nav-buttons">
          {showFirstLast && (
            <PaginationNav
              direction="left"
              disabled={currentPage === 1 || disabled}
              onClick={() => handlePageChange(1)}
              double
            />
          )}

          <PaginationNav
            direction="left"
            disabled={currentPage === 1 || disabled}
            onClick={() => handlePageChange(currentPage - 1)}
          />

          <div className="pagination__numbers">
            {paginationRange.map((pageNumber, index) =>
              renderPageButton(pageNumber, index)
            )}
          </div>

          <PaginationNav
            direction="right"
            disabled={currentPage === totalPages || disabled}
            onClick={() => handlePageChange(currentPage + 1)}
          />

          {showFirstLast && (
            <PaginationNav
              direction="right"
              disabled={currentPage === totalPages || disabled}
              onClick={() => handlePageChange(totalPages)}
              double
            />
          )}
        </div>

        {showPageSize && (
          <div className="pagination__size-selector">
            <label className="pagination__size-label">
              Items per page:
              <select
                className="pagination__size-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={disabled}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="pagination__info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
