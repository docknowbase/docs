import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabs from "./Tabs";

const { TabList, Tab, TabPanels, TabPanel } = Tabs;

// Mock ResizeObserver for tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("Tabs Component", () => {
  const renderBasicTabs = (props = {}) => {
    return render(
      <Tabs {...props}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
          <Tab index={2}>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Content 1</TabPanel>
          <TabPanel index={1}>Content 2</TabPanel>
          <TabPanel index={2}>Content 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
  };

  describe("Basic Functionality", () => {
    test("renders all tabs", () => {
      renderBasicTabs();
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    test("shows first tab panel by default", () => {
      renderBasicTabs();
      expect(screen.getByText("Content 1")).toBeVisible();
      expect(screen.queryByText("Content 2")).not.toBeVisible();
      expect(screen.queryByText("Content 3")).not.toBeVisible();
    });

    test("switches tabs on click", async () => {
      renderBasicTabs();
      await userEvent.click(screen.getByText("Tab 2"));
      expect(screen.queryByText("Content 1")).not.toBeVisible();
      expect(screen.getByText("Content 2")).toBeVisible();
    });
  });

  describe("Props", () => {
    test("respects defaultTab prop", () => {
      renderBasicTabs({ defaultTab: 1 });
      expect(screen.queryByText("Content 1")).not.toBeVisible();
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    test("calls onChange handler", async () => {
      const onChange = vi.fn();
      renderBasicTabs({ onChange });
      await userEvent.click(screen.getByText("Tab 2"));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    test("applies variant class", () => {
      renderBasicTabs({ variant: "custom" });
      expect(document.querySelector(".tabs--custom")).toBeInTheDocument();
    });

    test("applies size class", () => {
      renderBasicTabs({ size: "small" });
      expect(document.querySelector(".tabs--small")).toBeInTheDocument();
    });

    test("applies align class", () => {
      renderBasicTabs({ align: "center" });
      expect(document.querySelector(".tabs--center")).toBeInTheDocument();
    });

    test("applies fullWidth class", () => {
      renderBasicTabs({ fullWidth: true });
      expect(document.querySelector(".tabs--full-width")).toBeInTheDocument();
    });

    test("applies custom className", () => {
      renderBasicTabs({ className: "custom-class" });
      expect(document.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Tab Component", () => {
    test("handles disabled state", async () => {
      render(
        <Tabs>
          <TabList>
            <Tab index={0}>Tab 1</Tab>
            <Tab index={1} disabled>
              Tab 2
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel index={0}>Content 1</TabPanel>
            <TabPanel index={1}>Content 2</TabPanel>
          </TabPanels>
        </Tabs>
      );

      const disabledTab = screen.getByText("Tab 2");
      expect(disabledTab).toHaveClass("tabs__tab--disabled");
      expect(disabledTab).toBeDisabled();

      await userEvent.click(disabledTab);
      expect(screen.getByText("Content 1")).toBeVisible();
      expect(screen.queryByText("Content 2")).not.toBeVisible();
    });

    test("applies custom className to Tab", () => {
      render(
        <Tabs>
          <TabList>
            <Tab index={0} className="custom-tab">
              Tab 1
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel index={0}>Content 1</TabPanel>
          </TabPanels>
        </Tabs>
      );
      expect(screen.getByText("Tab 1")).toHaveClass("custom-tab");
    });
  });

  describe("TabPanel Component", () => {
    test("applies custom className to TabPanel", () => {
      render(
        <Tabs>
          <TabList>
            <Tab index={0}>Tab 1</Tab>
          </TabList>
          <TabPanels>
            <TabPanel index={0} className="custom-panel">
              Content 1
            </TabPanel>
          </TabPanels>
        </Tabs>
      );
      expect(screen.getByText("Content 1").parentElement).toHaveClass(
        "custom-panel"
      );
    });

    test("only renders active panel content", () => {
      const { container } = renderBasicTabs();
      const panels = container.querySelectorAll(".tabs__panel");
      expect(panels[0]).toHaveTextContent("Content 1");
      expect(panels[1]).toBeEmpty();
    });
  });

  describe("Accessibility", () => {
    test("has correct ARIA attributes", () => {
      renderBasicTabs();
      const tab = screen.getByText("Tab 1");
      expect(tab).toHaveAttribute("role", "tab");
      expect(tab).toHaveAttribute("aria-selected", "true");

      const panel = screen.getByText("Content 1").parentElement;
      expect(panel).toHaveAttribute("role", "tabpanel");
    });

    test("manages tabIndex correctly", async () => {
      renderBasicTabs();
      const tab1 = screen.getByText("Tab 1");
      const tab2 = screen.getByText("Tab 2");

      expect(tab1).toHaveAttribute("tabIndex", "0");
      expect(tab2).toHaveAttribute("tabIndex", "-1");

      await userEvent.click(tab2);

      expect(tab1).toHaveAttribute("tabIndex", "-1");
      expect(tab2).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Animation", () => {
    test("updates indicator style on tab change", async () => {
      const { container } = renderBasicTabs();
      const indicator = container.querySelector(".tabs__indicator");
      const initialStyle = indicator.style.cssText;

      await userEvent.click(screen.getByText("Tab 2"));

      expect(indicator.style.cssText).not.toBe(initialStyle);
    });

    test("respects animated prop", async () => {
      const { container } = renderBasicTabs({ animated: false });
      const indicator = container.querySelector(".tabs__indicator");

      expect(indicator.style.cssText).toBe("");

      await userEvent.click(screen.getByText("Tab 2"));
      expect(indicator.style.cssText).toBe("");
    });
  });
});
