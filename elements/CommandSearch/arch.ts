// src/types/common.ts
import { ReactNode } from 'react';

export type IconComponent = React.FC<{
  size?: number;
  className?: string;
}>;

// src/domain/models/SearchResult.ts
import { ReactNode } from 'react';

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly icon: ReactNode;
  readonly shortcut?: readonly string[];
}

// src/domain/models/SearchFilters.ts
export interface SearchFilters {
  readonly query: string;
  readonly category: string | null;
}

// src/domain/ports/SearchPort.ts
import { SearchResult } from '../models/SearchResult';
import { SearchFilters } from '../models/SearchFilters';

export interface SearchPort {
  search(filters: SearchFilters): Promise<SearchResult[]>;
  getCategories(): Promise<string[]>;
}

// src/domain/usecases/SearchUseCase.ts
import { SearchPort } from '../ports/SearchPort';
import { SearchResult } from '../models/SearchResult';
import { SearchFilters } from '../models/SearchFilters';

export class SearchUseCase {
  constructor(private readonly searchPort: SearchPort) {}

  async executeSearch(filters: SearchFilters): Promise<SearchResult[]> {
    return await this.searchPort.search(filters);
  }

  async getCategories(): Promise<string[]> {
    return await this.searchPort.getCategories();
  }
}

// src/infrastructure/adapters/LocalSearchAdapter.ts
import { SearchPort } from '../../domain/ports/SearchPort';
import { SearchResult } from '../../domain/models/SearchResult';
import { SearchFilters } from '../../domain/models/SearchFilters';
import {
  File,
  Settings,
  Users,
  Calendar,
  Mail,
  Star,
  BookOpen,
  Coffee,
  Music,
  Image,
} from "lucide-react";
import React from 'react';

export class LocalSearchAdapter implements SearchPort {
  private readonly searchResults: ReadonlyArray<SearchResult> = [
    {
      id: "1",
      title: "Recent Documents",
      category: "Files",
      icon: <File size={18} />,
    },
    // ... add all your search results here
  ] as const;

  async search({ query, category }: SearchFilters): Promise<SearchResult[]> {
    const results = this.searchResults.filter((result) => {
      const matchesSearch = result.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = !category || result.category === category;
      return matchesSearch && matchesCategory;
    });
    
    return Promise.resolve(results);
  }

  async getCategories(): Promise<string[]> {
    const categories = Array.from(
      new Set(this.searchResults.map((result) => result.category))
    );
    return Promise.resolve(categories);
  }
}

// src/presentation/hooks/useCommandSearch.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchResult } from '../../domain/models/SearchResult';
import { SearchUseCase } from '../../domain/usecases/SearchUseCase';

interface UseCommandSearchProps {
  readonly searchUseCase: SearchUseCase;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface UseCommandSearchResult {
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly selectedIndex: number;
  readonly setSelectedIndex: (index: number) => void;
  readonly activeCategory: string | null;
  readonly setActiveCategory: (category: string | null) => void;
  readonly filteredResults: SearchResult[];
  readonly categories: string[];
  readonly handleKeyDown: (e: React.KeyboardEvent) => void;
  readonly handleResultClick: (result: SearchResult) => void;
  readonly searchInputRef: React.RefObject<HTMLInputElement>;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export const useCommandSearch = ({
  searchUseCase,
  isOpen,
  onClose,
}: UseCommandSearchProps): UseCommandSearchResult => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await searchUseCase.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    }
  }, [searchUseCase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchUseCase.executeSearch({
          query: searchQuery,
          category: activeCategory,
        });
        setFilteredResults(results);
        setSelectedIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch results'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, activeCategory, searchUseCase]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredResults.length) % filteredResults.length
        );
        break;
      case "Enter":
        if (filteredResults[selectedIndex]) {
          handleResultClick(filteredResults[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  }, [filteredResults, selectedIndex, onClose]);

  const handleResultClick = useCallback((result: SearchResult): void => {
    console.log("Selected:", result.title);
    onClose();
  }, [onClose]);

  return {
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    activeCategory,
    setActiveCategory,
    filteredResults,
    categories,
    handleKeyDown,
    handleResultClick,
    searchInputRef,
    isLoading,
    error,
  };
};

// src/presentation/components/CommandSearchResults.tsx
import React, { memo } from 'react';
import { SearchResult } from '../../domain/models/SearchResult';
import classNames from 'classnames';

interface CommandSearchResultsProps {
  readonly results: ReadonlyArray<SearchResult>;
  readonly selectedIndex: number;
  readonly onResultClick: (result: SearchResult) => void;
  readonly onMouseEnter: (index: number) => void;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export const CommandSearchResults: React.FC<CommandSearchResultsProps> = memo(({
  results,
  selectedIndex,
  onResultClick,
  onMouseEnter,
  isLoading,
  error,
}) => {
  if (error) {
    return <div className="command-search__error">{error.message}</div>;
  }

  if (isLoading) {
    return <div className="command-search__loading">Loading...</div>;
  }

  if (results.length === 0) {
    return <div className="command-search__no-results">No results found</div>;
  }

  return (
    <div className="command-search__results">
      {results.map((result, index) => (
        <div
          key={result.id}
          className={classNames("command-search__result", {
            "command-search__result--selected": index === selectedIndex,
          })}
          onClick={() => onResultClick(result)}
          onMouseEnter={() => onMouseEnter(index)}
        >
          <div className="command-search__result-content">
            {result.icon}
            <span>{result.title}</span>
          </div>
          {result.shortcut && (
            <div className="command-search__result-shortcut">
              {result.shortcut.map((key, i) => (
                <React.Fragment key={i}>
                  <kbd>{key}</kbd>
                  {i < result.shortcut!.length - 1 && <span>+</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

CommandSearchResults.displayName = 'CommandSearchResults';

// src/presentation/components/CommandSearchCategories.tsx
import React, { memo } from 'react';
import classNames from 'classnames';
import { ChevronRight } from 'lucide-react';

interface CommandSearchCategoriesProps {
  readonly categories: ReadonlyArray<string>;
  readonly activeCategory: string | null;
  readonly onCategoryClick: (category: string) => void;
}

export const CommandSearchCategories: React.FC<CommandSearchCategoriesProps> = memo(({
  categories,
  activeCategory,
  onCategoryClick,
}) => (
  <div className="command-search__categories">
    {categories.map((category) => (
      <button
        key={category}
        className={classNames("command-search__category", {
          "command-search__category--active": activeCategory === category,
        })}
        onClick={() => onCategoryClick(category)}
        type="button"
      >
        {category}
        <ChevronRight size={16} />
      </button>
    ))}
  </div>
));

CommandSearchCategories.displayName = 'CommandSearchCategories';

// src/presentation/components/CommandSearch.tsx
import React, { memo } from 'react';
import { Search } from 'lucide-react';
import { SearchUseCase } from '../../domain/usecases/SearchUseCase';
import { useCommandSearch } from '../hooks/useCommandSearch';
import { CommandSearchResults } from './CommandSearchResults';
import { CommandSearchCategories } from './CommandSearchCategories';

interface CommandSearchProps {
  readonly isCommandSearchOpen: boolean;
  readonly setCommandSearchOpen: (isOpen: boolean) => void;
  readonly searchUseCase: SearchUseCase;
}

export const CommandSearch: React.FC<CommandSearchProps> = memo(({
  isCommandSearchOpen,
  setCommandSearchOpen,
  searchUseCase,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    activeCategory,
    setActiveCategory,
    filteredResults,
    categories,
    handleKeyDown,
    handleResultClick,
    searchInputRef,
    isLoading,
    error,
  } = useCommandSearch({
    searchUseCase,
    isOpen: isCommandSearchOpen,
    onClose: () => setCommandSearchOpen(false),
  });

  if (!isCommandSearchOpen) return null;

  return (
    <div className="command-search">
      <div
        className="command-search__backdrop"
        onClick={() => setCommandSearchOpen(false)}
      />

      <div className="command-search__modal" onKeyDown={handleKeyDown}>
        <div className="command-search__header">
          <div className="command-search__search-wrapper">
            <Search size={20} className="command-search__search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="command-search__input"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search commands"
            />
            <div className="command-search__shortcuts">
              <kbd>esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>

        <div className="command-search__content">
          <CommandSearchCategories
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={(category) =>
              setActiveCategory(activeCategory === category ? null : category)
            }
          />

          <CommandSearchResults
            results={filteredResults}
            selectedIndex={selectedIndex}
            onResultClick={handleResultClick}
            onMouseEnter={setSelectedIndex}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
});

CommandSearch.displayName = 'CommandSearch';

// src/App.tsx
import React, { useState } from 'react';
import { CommandSearch } from './presentation/components/CommandSearch';
import { SearchUseCase } from './domain/usecases/SearchUseCase';
import { LocalSearchAdapter } from './infrastructure/adapters/LocalSearchAdapter';

const App: React.FC = () => {
  const [isCommandSearchOpen, setCommandSearchOpen] = useState<boolean>(false);
  const searchAdapter = new LocalSearchAdapter();
  const searchUseCase = new SearchUseCase(searchAdapter);

  return (
    <div>
      <button 
        onClick={() => setCommandSearchOpen(true)}
        type="button"
        aria-label="Open command search"
      >
        Open Command Search
      </button>
      
      <CommandSearch
        isCommandSearchOpen={isCommandSearchOpen}
        setCommandSearchOpen={setCommandSearchOpen}
        searchUseCase={searchUseCase}
      />
    </div>
  );
};

export default App;