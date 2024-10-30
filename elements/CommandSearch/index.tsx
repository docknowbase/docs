import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import {
  Search,
  Settings,
  Command,
  File,
  Users,
  Calendar,
  Mail,
  Star,
  BookOpen,
  Coffee,
  Music,
  Image,
  ChevronRight,
  X,
} from "lucide-react";

interface CommandSearchProps {
  isCommandSearchOpen: boolean;
  setCommandSearchOpen: (isOpen: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string[];
}

const CommandSearch: React.FC<CommandSearchProps> = ({
  isCommandSearchOpen,
  setCommandSearchOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults: SearchResult[] = [
    // Files
    {
      id: "1",
      title: "Recent Documents",
      category: "Files",
      icon: <File size={18} />,
    },
    {
      id: "2",
      title: "Downloads",
      category: "Files",
      icon: <File size={18} />,
    },
    {
      id: "3",
      title: "Documents",
      category: "Files",
      icon: <File size={18} />,
    },

    // Tools
    {
      id: "4",
      title: "Settings",
      category: "Tools",
      icon: <Settings size={18} />,
      shortcut: ["⌘", "S"],
    },
    {
      id: "5",
      title: "User Profile",
      category: "Tools",
      icon: <Users size={18} />,
    },
    {
      id: "6",
      title: "Calendar",
      category: "Tools",
      icon: <Calendar size={18} />,
    },

    // Actions
    {
      id: "7",
      title: "New Message",
      category: "Actions",
      icon: <Mail size={18} />,
      shortcut: ["⌘", "N"],
    },
    {
      id: "8",
      title: "Add to Favorites",
      category: "Actions",
      icon: <Star size={18} />,
    },
    {
      id: "9",
      title: "Open Library",
      category: "Actions",
      icon: <BookOpen size={18} />,
    },

    // Quick Access
    {
      id: "10",
      title: "Take a Break",
      category: "Quick Access",
      icon: <Coffee size={18} />,
    },
    {
      id: "11",
      title: "Play Music",
      category: "Quick Access",
      icon: <Music size={18} />,
    },
    {
      id: "12",
      title: "View Gallery",
      category: "Quick Access",
      icon: <Image size={18} />,
    },
  ];

  useEffect(() => {
    if (isCommandSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isCommandSearchOpen]);

  const filteredResults = searchResults.filter((result) => {
    const matchesSearch = result.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || result.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(searchResults.map((result) => result.category))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        setCommandSearchOpen(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log("Selected:", result.title);
    setCommandSearchOpen(false);
  };

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
            />
            <div className="command-search__shortcuts">
              <kbd>esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>

        <div className="command-search__content">
          <div className="command-search__categories">
            {categories.map((category) => (
              <button
                key={category}
                className={classNames("command-search__category", {
                  "command-search__category--active":
                    activeCategory === category,
                })}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === category ? null : category
                  )
                }
              >
                {category}
                <ChevronRight size={16} />
              </button>
            ))}
          </div>

          <div className="command-search__results">
            {filteredResults.map((result, index) => (
              <div
                key={result.id}
                className={classNames("command-search__result", {
                  "command-search__result--selected": index === selectedIndex,
                })}
                onClick={() => handleResultClick(result)}
                onMouseEnter={() => setSelectedIndex(index)}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandSearch;
