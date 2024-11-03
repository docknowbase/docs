import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuBar from './MenuBar';

describe('MenuBar Component', () => {
  // Mock window dimensions for consistent testing
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    cleanup();
    window.innerWidth = 1024;
    window.innerHeight = 768;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  // Mock menu items for testing
  const mockMenuItems = [
    {
      id: 'file',
      label: 'File',
      children: [
        {
          id: 'new',
          label: 'New',
          icon: '📄',
          shortcut: 'Ctrl+N',
          onClick: vi.fn(),
        },
        {
          id: 'open',
          label: 'Open',
          icon: '📂',
          shortcut: 'Ctrl+O',
          onClick: vi.fn(),
        },
        { id: 'sep1', separator: true },
        {
          id: 'save',
          label: 'Save',
          icon: '💾',
          shortcut: 'Ctrl+S',
          disabled: true,
          onClick: vi.fn(),
        },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      children: [
        {
          id: 'undo',
          label: 'Undo',
          shortcut: 'Ctrl+Z',
          onClick: vi.fn(),
        },
        {
          id: 'submenu',
          label: 'More Options',
          children: [
            {
              id: 'subOption1',
              label: 'Sub Option 1',
              onClick: vi.fn(),
            },
            {
              id: 'subOption2',
              label: 'Sub Option 2',
              onClick: vi.fn(),
            },
          ],
        },
      ],
    },
    {
      id: 'simple',
      label: 'Simple',
      onClick: vi.fn(),
    },
  ];

  // Basic Rendering Tests
  describe('Rendering', () => {
    test('renders root menu items correctly', () => {
      render(<MenuBar items={mockMenuItems} />);
      expect(screen.getByText('File')).toBeDefined();
      expect(screen.getByText('Edit')).toBeDefined();
      expect(screen.getByText('Simple')).toBeDefined();
    });

    test('renders with custom className', () => {
      const { container } = render(
        <MenuBar items={mockMenuItems} className="custom-menu" />
      );
      expect(container.firstChild).toHaveClass('custom-menu');
    });

    test('renders empty menu bar when no items provided', () => {
      const { container } = render(<MenuBar items={[]} />);
      expect(container.querySelector('.menu-bar__root')?.children.length).toBe(0);
    });
  });

  // Interaction Tests
  describe('Menu Interactions', () => {
    test('opens submenu on click', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      expect(screen.getByText('New')).toBeDefined();
      expect(screen.getByText('Open')).toBeDefined();
    });

    test('closes submenu on second click', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      await userEvent.click(screen.getByText('File'));
      expect(screen.queryByText('New')).toBeNull();
    });

    test('switches between root menus', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      await userEvent.click(screen.getByText('Edit'));
      expect(screen.getByText('Undo')).toBeDefined();
      expect(screen.queryByText('New')).toBeNull();
    });

    test('handles nested submenus', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.hover(screen.getByText('More Options'));
      expect(screen.getByText('Sub Option 1')).toBeDefined();
    });

    test('triggers onClick for menu items without children', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('Simple'));
      expect(mockMenuItems[2].onClick).toHaveBeenCalledTimes(1);
    });

    test('handles disabled items', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      await userEvent.click(screen.getByText('Save'));
      expect(mockMenuItems[0].children![3].onClick).not.toHaveBeenCalled();
    });
  });

  // Mouse Interaction Tests
  describe('Mouse Interactions', () => {
    test('opens submenu on hover when another menu is active', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      await userEvent.hover(screen.getByText('Edit'));
      expect(screen.getByText('Undo')).toBeDefined();
    });

    test('shows nested submenu on hover', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.hover(screen.getByText('More Options'));
      expect(screen.getByText('Sub Option 1')).toBeDefined();
      expect(screen.getByText('Sub Option 2')).toBeDefined();
    });

    test('closes all menus when clicking outside', () => {
      render(<MenuBar items={mockMenuItems} />);
      fireEvent.click(screen.getByText('File'));
      fireEvent.click(document.body);
      expect(screen.queryByText('New')).toBeNull();
    });
  });

  // Visual Elements Tests
  describe('Visual Elements', () => {
    test('renders separators correctly', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      expect(document.querySelector('.menu-bar__separator')).toBeDefined();
    });

    test('renders icons correctly', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      expect(screen.getByText('📄')).toBeDefined();
    });

    test('renders shortcuts correctly', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      expect(screen.getByText('Ctrl+N')).toBeDefined();
    });

    test('applies correct classes for disabled items', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      const saveItem = screen.getByText('Save').closest('.menu-bar__item');
      expect(saveItem).toHaveClass('menu-bar__item--disabled');
    });
  });

  // Edge Cases and Boundary Tests
  describe('Edge Cases', () => {
    test('handles menu positioning at screen edges', () => {
      window.innerWidth = 300; // Force small screen width
      render(<MenuBar items={mockMenuItems} />);
      fireEvent.click(screen.getByText('File'));
      const submenu = document.querySelector('.menu-bar__submenu');
      expect(submenu).toBeDefined();
      // Check that submenu is within viewport
      const rect = submenu!.getBoundingClientRect();
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    });

    test('handles rapid menu switching', async () => {
      render(<MenuBar items={mockMenuItems} />);
      await userEvent.click(screen.getByText('File'));
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('File'));
      expect(screen.getByText('New')).toBeDefined();
      expect(screen.queryByText('Undo')).toBeNull();
    });

    test('handles items without optional properties', () => {
      const simpleItems = [
        {
          id: 'simple',
          label: 'Simple',
          children: [{ id: 'child', label: 'Child' }],
        },
      ];
      render(<MenuBar items={simpleItems} />);
      expect(screen.getByText('Simple')).toBeDefined();
    });
  });
});