import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonGroup } from './Skeleton';
import React from 'react';

describe('Skeleton Component', () => {
  describe('Basic Rendering', () => {
    it('renders default text variant', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('.skeleton')).toBeTruthy();
      expect(container.querySelector('.skeleton--text')).toBeTruthy();
      expect(container.querySelector('.skeleton__text-row')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('renders with custom dimensions', () => {
      const { container } = render(<Skeleton width="200px" height="100px" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({
        width: '200px',
        height: '100px'
      });
    });
  });

  describe('Variants', () => {
    it('renders circular variant', () => {
      const { container } = render(<Skeleton variant="circular" />);
      expect(container.querySelector('.skeleton--circular')).toBeTruthy();
    });

    it('renders rectangular variant', () => {
      const { container } = render(<Skeleton variant="rectangular" />);
      expect(container.querySelector('.skeleton--rectangular')).toBeTruthy();
    });

    it('renders custom variant with children', () => {
      const { container } = render(
        <Skeleton variant="custom">
          <div className="child">Custom Child</div>
        </Skeleton>
      );
      expect(container.querySelector('.skeleton--custom')).toBeTruthy();
      expect(container.querySelector('.child.skeleton__custom-child')).toBeTruthy();
    });
  });

  describe('Text Variant Features', () => {
    it('renders multiple rows for text variant', () => {
      const { container } = render(<Skeleton variant="text" rows={3} />);
      expect(container.querySelectorAll('.skeleton__text-row')).toHaveLength(3);
    });

    it('applies random widths to text rows when randomWidths is true', () => {
      const { container } = render(<Skeleton variant="text" rows={3} randomWidths />);
      const rows = container.querySelectorAll('.skeleton__text-row');
      const widths = Array.from(rows).map(row => (row as HTMLElement).style.width);
      expect(widths.some(width => width !== widths[0])).toBeTruthy();
    });

    it('applies consistent widths to text rows when randomWidths is false', () => {
      const { container } = render(<Skeleton variant="text" rows={3} randomWidths={false} />);
      const rows = container.querySelectorAll('.skeleton__text-row');
      const widths = Array.from(rows).map(row => (row as HTMLElement).style.width);
      expect(widths.every(width => width === '100%')).toBeTruthy();
    });
  });

  describe('Animation Features', () => {
    it('applies animation classes when animate is true', () => {
      const { container } = render(<Skeleton animate animation="pulse" />);
      expect(container.querySelector('.skeleton--animated')).toBeTruthy();
      expect(container.querySelector('.skeleton--pulse')).toBeTruthy();
    });

    it('does not apply animation classes when animate is false', () => {
      const { container } = render(<Skeleton animate={false} animation="pulse" />);
      expect(container.querySelector('.skeleton--animated')).toBeFalsy();
      expect(container.querySelector('.skeleton--pulse')).toBeFalsy();
    });

    it('applies different animation types correctly', () => {
      const animations = ['pulse', 'wave', 'shimmer'] as const;
      animations.forEach(animation => {
        const { container } = render(<Skeleton animate animation={animation} />);
        expect(container.querySelector(`.skeleton--${animation}`)).toBeTruthy();
      });
    });
  });

  describe('Style Features', () => {
    it('applies border radius correctly', () => {
      const { container } = render(<Skeleton borderRadius="8px" />);
      expect(container.querySelector('.skeleton')).toHaveStyle({
        borderRadius: '8px'
      });
    });

    it('applies dark theme class', () => {
      const { container } = render(<Skeleton dark />);
      expect(container.querySelector('.skeleton--dark')).toBeTruthy();
    });

    it('merges custom styles with base styles', () => {
      const customStyle = { margin: '10px', padding: '5px' };
      const { container } = render(
        <Skeleton style={customStyle} width="100px" height="100px" />
      );
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({
        margin: '10px',
        padding: '5px',
        width: '100px',
        height: '100px'
      });
    });
  });

  describe('Custom Element Type', () => {
    it('renders with custom element type', () => {
      const { container } = render(<Skeleton as="span" />);
      expect(container.querySelector('span.skeleton')).toBeTruthy();
    });
  });
});

describe('SkeletonGroup Component', () => {
  it('renders multiple skeleton items based on count', () => {
    const { container } = render(
      <SkeletonGroup count={3}>
        <Skeleton />
      </SkeletonGroup>
    );
    expect(container.querySelectorAll('.skeleton-group__item')).toHaveLength(3);
  });

  it('applies custom gap', () => {
    const { container } = render(
      <SkeletonGroup gap="2rem">
        <Skeleton />
      </SkeletonGroup>
    );
    expect(container.querySelector('.skeleton-group')).toHaveStyle({
      '--skeleton-gap': '2rem'
    });
  });

  it('applies numeric gap in pixels', () => {
    const { container } = render(
      <SkeletonGroup gap={20}>
        <Skeleton />
      </SkeletonGroup>
    );
    expect(container.querySelector('.skeleton-group')).toHaveStyle({
      '--skeleton-gap': '20px'
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <SkeletonGroup className="custom-group">
        <Skeleton />
      </SkeletonGroup>
    );
    expect(container.querySelector('.skeleton-group.custom-group')).toBeTruthy();
  });
});