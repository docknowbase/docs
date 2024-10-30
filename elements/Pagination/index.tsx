// src/components/Pagination/index.jsx
import React, { useMemo } from "react";
import classNames from "classnames";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import "./styles.scss";

const Pagination = ({
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
  const generatePaginationRange = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      return [
        ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
        "dots",
        totalPages,
      ];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      return [
        1,
        "dots",
        ...Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
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
      totalPages,
    ];
  };

  const paginationRange = useMemo(generatePaginationRange, [
    totalPages,
    currentPage,
    siblingCount,
  ]);

  const handlePageChange = (page) => {
    if (page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (event) => {
    if (!disabled) {
      onPageSizeChange(Number(event.target.value));
    }
  };

  const renderPageButton = (pageNumber, index) => {
    if (pageNumber === "dots") {
      return (
        <span key={`dots-${index}`} className="pagination__dots">
          <MoreHorizontal size={18} />
        </span>
      );
    }

    return (
      <button
        key={pageNumber}
        className={classNames("pagination__button", {
          "pagination__button--active": pageNumber === currentPage,
          "pagination__button--disabled": disabled,
        })}
        onClick={() => handlePageChange(pageNumber)}
        disabled={disabled}
        aria-current={pageNumber === currentPage ? "page" : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  return (
    <div className={classNames("pagination", className)}>
      <div className="pagination__controls">
        {/* Navigation buttons */}
        <div className="pagination__nav-buttons">
          {showFirstLast && (
            <button
              className={classNames("pagination__nav", {
                "pagination__nav--disabled": currentPage === 1 || disabled,
              })}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || disabled}
              aria-label="Go to first page"
            >
              <ChevronLeft size={18} />
              <ChevronLeft size={18} className="pagination__nav-double" />
            </button>
          )}

          <button
            className={classNames("pagination__nav", {
              "pagination__nav--disabled": currentPage === 1 || disabled,
            })}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page numbers */}
          <div className="pagination__numbers">
            {paginationRange.map((pageNumber, index) =>
              renderPageButton(pageNumber, index)
            )}
          </div>

          <button
            className={classNames("pagination__nav", {
              "pagination__nav--disabled":
                currentPage === totalPages || disabled,
            })}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>

          {showFirstLast && (
            <button
              className={classNames("pagination__nav", {
                "pagination__nav--disabled":
                  currentPage === totalPages || disabled,
              })}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              aria-label="Go to last page"
            >
              <ChevronRight size={18} />
              <ChevronRight size={18} className="pagination__nav-double" />
            </button>
          )}
        </div>

        {/* Page size selector */}
        {showPageSize && (
          <div className="pagination__size-selector">
            <label className="pagination__size-label">
              Items per page:
              <select
                className="pagination__size-select"
                value={pageSize}
                onChange={handlePageSizeChange}
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

      {/* Page info */}
      <div className="pagination__info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
