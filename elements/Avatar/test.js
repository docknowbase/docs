import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Avatar, AvatarProps } from './Avatar';

describe('Avatar Component', () => {
  const defaultProps: AvatarProps = {
    src: 'https://example.com/avatar.jpg',
    alt: 'Test Avatar',
  };

  const renderAvatar = (props: Partial<AvatarProps> = {}) => {
    return render(<Avatar {...defaultProps} {...props} />);
  };

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderAvatar();
      expect(container).toBeTruthy();
    });

    it('renders with default props', () => {
      const { container } = renderAvatar();
      const avatar = container.querySelector('.avatar');
      expect(avatar).toHaveClass('avatar--medium', 'avatar--circle');
    });

    it('applies custom className', () => {
      const { container } = renderAvatar({ className: 'custom-class' });
      expect(container.querySelector('.avatar')).toHaveClass('custom-class');
    });
  });

  describe('Image Handling', () => {
    it('renders image when src is provided', () => {
      renderAvatar();
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    it('renders initials when no src is provided but initials are', () => {
      const { container } = renderAvatar({ src: undefined, initials: 'John Doe' });
      const initialsElement = container.querySelector('.avatar__initials');
      expect(initialsElement).toHaveTextContent('JD');
    });

    it('renders fallback icon when no src or initials are provided', () => {
      const { container } = renderAvatar({ src: undefined });
      expect(container.querySelector('.avatar__fallback')).toBeTruthy();
    });

    it('shows fallback when image fails to load', async () => {
      const { container } = renderAvatar();
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(container.querySelector('.avatar__fallback')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it.each(['small', 'medium', 'large', 'xlarge'] as const)('renders %s size correctly', (size) => {
      const { container } = renderAvatar({ size });
      expect(container.querySelector('.avatar')).toHaveClass(`avatar--${size}`);
    });
  });

  describe('Shape Variants', () => {
    it.each(['circle', 'square', 'rounded'] as const)('renders %s shape correctly', (shape) => {
      const { container } = renderAvatar({ shape });
      expect(container.querySelector('.avatar')).toHaveClass(`avatar--${shape}`);
    });
  });

  describe('Status Indicator', () => {
    it.each(['online', 'offline', 'busy', 'away'] as const)('renders %s status correctly', (status) => {
      const { container } = renderAvatar({ status, showStatus: true });
      const statusElement = container.querySelector('.avatar__status');
      expect(statusElement).toHaveClass(`avatar__status--${status}`);
    });

    it('does not render status indicator when showStatus is false', () => {
      const { container } = renderAvatar({ status: 'online', showStatus: false });
      expect(container.querySelector('.avatar__status')).toBeFalsy();
    });
  });

  describe('Interaction', () => {
    it('handles click events when clickable', () => {
      const onClick = vi.fn();
      renderAvatar({ clickable: true, onClick });
      
      const avatar = screen.getByRole('button');
      fireEvent.click(avatar);
      expect(onClick).toHaveBeenCalled();
    });

    it('does not handle click events when not clickable', () => {
      const onClick = vi.fn();
      renderAvatar({ clickable: false, onClick });
      
      const avatar = screen.getByRole('generic');
      fireEvent.click(avatar);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('has correct accessibility attributes when clickable', () => {
      const { container } = renderAvatar({ clickable: true });
      const avatar = container.querySelector('.avatar');
      expect(avatar).toHaveAttribute('role', 'button');
      expect(avatar).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Loading State', () => {
    it('renders skeleton loader when loading is true', () => {
      const { container } = renderAvatar({ loading: true });
      expect(container.querySelector('.avatar__skeleton')).toBeTruthy();
    });

    it('does not render content when loading', () => {
      const { container } = renderAvatar({ loading: true });
      expect(container.querySelector('.avatar__image')).toBeFalsy();
      expect(container.querySelector('.avatar__initials')).toBeFalsy();
      expect(container.querySelector('.avatar__fallback')).toBeFalsy();
    });
  });

  describe('Border Styling', () => {
    it('applies bordered class when bordered prop is true', () => {
      const { container } = renderAvatar({ bordered: true });
      expect(container.querySelector('.avatar')).toHaveClass('avatar--bordered');
    });
  });

  describe('Initials Generation', () => {
    it('generates correct initials from single name', () => {
      const { container } = renderAvatar({ src: undefined, initials: 'John' });
      expect(container.querySelector('.avatar__initials')).toHaveTextContent('J');
    });

    it('generates correct initials from full name', () => {
      const { container } = renderAvatar({ src: undefined, initials: 'John Doe' });
      expect(container.querySelector('.avatar__initials')).toHaveTextContent('JD');
    });

    it('generates correct initials from long name', () => {
      const { container } = renderAvatar({ src: undefined, initials: 'John Middle Doe' });
      expect(container.querySelector('.avatar__initials')).toHaveTextContent('JM');
    });
  });

  describe('Class Combinations', () => {
    it('applies correct classes for image avatar', () => {
      const { container } = renderAvatar();
      const avatar = container.querySelector('.avatar');
      expect(avatar).toHaveClass('avatar--has-image');
    });

    it('applies correct classes for initials avatar', () => {
      const { container } = renderAvatar({ src: undefined, initials: 'JD' });
      const avatar = container.querySelector('.avatar');
      expect(avatar).toHaveClass('avatar--has-initials');
    });
  });
});