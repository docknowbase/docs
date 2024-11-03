import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandSearch from './CommandSearch';

describe('CommandSearch', () => {
  const mockSetCommandSearchOpen = vi.fn();
  
  beforeEach(() => {
    mockSetCommandSearchOpen.mockClear();
  });

  describe('Rendering', () => {
    it('should not render when isCommandSearchOpen is false', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={false} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      expect(screen.queryByPlaceholderText('Search commands...')).toBeNull();
    });

    it('should render when isCommandSearchOpen is true', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
    });

    it('should render all initial categories', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const expectedCategories = ['Files', 'Tools', 'Actions', 'Quick Access'];
      expectedCategories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('should render all initial search results', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const expectedResults = [
        'Recent Documents',
        'Downloads',
        'Documents',
        'Settings',
        'User Profile',
        'Calendar',
        'New Message',
        'Add to Favorites',
        'Open Library',
        'Take a Break',
        'Play Music',
        'View Gallery'
      ];
      
      expectedResults.forEach(result => {
        expect(screen.getByText(result)).toBeInTheDocument();
      });
    });

    it('should render keyboard shortcuts for applicable items', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter results based on search query', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      await userEvent.type(searchInput, 'set');
      
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.queryByText('Calendar')).toBeNull();
    });

    it('should be case insensitive when searching', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      await userEvent.type(searchInput, 'SETTINGS');
      
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show no results when search query matches nothing', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      await userEvent.type(searchInput, 'nonexistent');
      
      const results = screen.queryAllByRole('button', { name: /documents|settings|calendar/i });
      expect(results).toHaveLength(0);
    });
  });

  describe('Category Filtering', () => {
    it('should filter results when category is selected', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      await userEvent.click(screen.getByText('Files'));
      
      expect(screen.getByText('Recent Documents')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
      expect(screen.queryByText('Settings')).toBeNull();
    });

    it('should toggle category filter when clicking the same category twice', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const filesCategory = screen.getByText('Files');
      await userEvent.click(filesCategory);
      await userEvent.click(filesCategory);
      
      // Should show all results again
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Recent Documents')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate results with arrow keys', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      expect(screen.getByText('Recent Documents').parentElement)
        .toHaveClass('command-search__result--selected');
      
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      expect(screen.getByText('Downloads').parentElement)
        .toHaveClass('command-search__result--selected');
      
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      expect(screen.getByText('Recent Documents').parentElement)
        .toHaveClass('command-search__result--selected');
    });

    it('should wrap around when reaching the end of the list', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      
      // Navigate to the last item
      for (let i = 0; i < 12; i++) {
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      }
      
      expect(screen.getByText('View Gallery').parentElement)
        .toHaveClass('command-search__result--selected');
      
      // Press down again to wrap to the first item
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      expect(screen.getByText('Recent Documents').parentElement)
        .toHaveClass('command-search__result--selected');
    });

    it('should close on escape key', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      
      expect(mockSetCommandSearchOpen).toHaveBeenCalledWith(false);
    });

    it('should select result on enter key', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search commands...');
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected:', 'Recent Documents');
      expect(mockSetCommandSearchOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Click Interactions', () => {
    it('should close when clicking backdrop', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const backdrop = screen.getByClassName('command-search__backdrop');
      await userEvent.click(backdrop);
      
      expect(mockSetCommandSearchOpen).toHaveBeenCalledWith(false);
    });

    it('should select result when clicking on it', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const result = screen.getByText('Settings');
      await userEvent.click(result);
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected:', 'Settings');
      expect(mockSetCommandSearchOpen).toHaveBeenCalledWith(false);
    });

    it('should update selected index on mouse hover', async () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      const result = screen.getByText('Settings').parentElement;
      fireEvent.mouseEnter(result!);
      
      expect(result).toHaveClass('command-search__result--selected');
    });
  });

  describe('Focus Management', () => {
    it('should focus search input when opened', () => {
      render(
        <CommandSearch 
          isCommandSearchOpen={true} 
          setCommandSearchOpen={mockSetCommandSearchOpen} 
        />
      );
      
      expect(screen.getByPlaceholderText('Search commands...'))
        .toHaveFocus();
    });
  });
});