import React, { useState } from "react";

import { Bell, File, Folder, Home, Settings, Users } from "lucide-react"; // or any icon library
import logo from "../assets/react.svg";
import Accordion from "./Accordion";
import AlertDialog from "./Alert";
import Avatar from "./Avatar";
import Breadcrumb from "./Breadcrumbs";
import Carousel from "./Carousel";
import Checkbox from "./Checkbox";
import ExpandablePanel from "./Collapsible";
import CommandSearch from "./CommandSearch";
import ContextMenu from "./ContextMenu";
import DatePicker from "./Datepicker";
import DateRangePicker from "./Daterange";
import Dialog from "./Dialog";
import DraggableElement from "./Draggable";
import Drawer from "./Drawer";
import DropdownExample from "./Dropdown";
import HoverCard from "./HoverCard";
import MultiselectExample from "./Multiselect";
import NavigationMenu from "./NavigationMenu";
import Pagination from "./Pagination";
import Popover from "./Popover";
import ProgressBar from "./Progress";
import RadioGroup from "./Radio";
import Sheet from "./Sidebar";
import Skeleton from "./Skeleton";
import RangeSlider from "./Slider";
import DualRangeSlider from "./SliderRange";
import Sonner, { SonnerProvider } from "./Sonner";
import Switch from "./Switch";
import Tabs from "./Tabs";
import Toast, { ToastProvider } from "./Toast";
import ToggleButton from "./Toggle";
import FormatToggleGroup from "./ToggleGroup";
import Tooltip from "./Tooltip";

function App() {
  const [count, setCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);

  const [selectedValue, setSelectedValue] = useState("option1");

  const handleDateSelect = (date) => {
    console.log("Selected date:", date);
  };

  const handleRangeSelect = ({ startDate, endDate }) => {
    console.log("Date range:", { startDate, endDate });
  };

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Documents",
      href: "/documents",
      icon: Folder,
    },
    {
      label: "Projects",
      href: "/documents/projects",
      icon: Folder,
    },
    {
      label: "Project A",
      href: "/documents/projects/project-a",
      icon: File,
    },
  ];

  const handleNavigate = (item) => {
    console.log("Navigating to:", item);
    // Handle navigation logic
  };

  const [value1, setValue1] = useState("option1");
  const [value2, setValue2] = useState("choice1");
  const [value3, setValue3] = useState("item1");

  const handleTabChange = (index) => {
    console.log("Active tab:", index);
  };

  const handleChange = (newState) => {
    console.log("Toggle state changed:", newState);
  };

  const handleFormatChange = (formats) => {
    console.log("Active formats:", formats);
    // Example: { bold: true, italic: false, underline: true }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 256; // Total number of items
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Fetch data for the new page here
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // Fetch data with new page size here
  };

  const [isOpen, setIsOpen] = useState(false);

  const [isSheetOpen, setSheetOpen] = useState(false);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const accordionItems = [
    {
      id: "1",
      title: "What is React?",
      content: (
        <div>
          <p>React is a JavaScript library for building user interfaces.</p>
          <ul>
            <li>Declarative</li>
            <li>Component-Based</li>
            <li>Learn Once, Write Anywhere</li>
          </ul>
        </div>
      ),
    },
    {
      id: "2",
      title: "Why use React?",
      content: "React makes it painless to create interactive UIs...",
    },
    {
      id: "3",
      title: "Getting Started",
      content: "To get started with React, you can use Create React App...",
      disabled: true,
    },
  ];

  const handleSubmit = (value: string) => {
    console.log("Submitted value:", value);
  };

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const items = [
    { id: "1", label: "Home", link: "/" },
    { id: "2", label: "About", link: "/about" },
    { id: "3", label: "Services", link: "/services" },
    { id: "4", label: "Contact", link: "/contact" },
  ];

  const navItems = [
    {
      id: "1",
      label: "Products",
      link: "/products",
      content: {
        id: "products-dropdown",
        title: "Our Products",
        description: "Discover our range of amazing products",
        links: [
          { label: "Featured Products", url: "/products/featured" },
          { label: "New Arrivals", url: "/products/new" },
          { label: "Best Sellers", url: "/products/best-sellers" },
        ],
      },
    },
    {
      id: "2",
      label: "Services",
      link: "/services",
      content: {
        id: "services-dropdown",
        title: "Our Services",
        description: "Professional services tailored to your needs",
        links: [
          { label: "Consulting", url: "/services/consulting" },
          { label: "Development", url: "/services/development" },
          { label: "Support", url: "/services/support" },
        ],
      },
    },
    // ... more menu items
  ];

  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const carouselItems = [
    {
      id: 1,
      image: "/path/to/image1.jpg",
      title: "Slide 1",
      description: "Description for slide 1",
    },
    {
      id: 1,
      image: "/path/to/image1.jpg",
      title: "Slide 1",
      description: "Description for slide 1",
    },
    {
      id: 1,
      image: "/path/to/image1.jpg",
      title: "Slide 1",
      description: "Description for slide 1",
    },
    // ... more items
  ];
  const menuOptions = [
    {
      id: "file",
      label: "File",
      icon: "📄",
      children: [
        {
          id: "new",
          label: "New",
          icon: "✨",
          children: [
            {
              id: "document",
              label: "Document",
              icon: "📝",
              onClick: () => console.log("New document"),
            },
            {
              id: "spreadsheet",
              label: "Spreadsheet",
              icon: "📊",
              onClick: () => console.log("New spreadsheet"),
            },
          ],
        },
        {
          id: "open",
          label: "Open",
          icon: "📂",
          onClick: () => console.log("Open"),
        },
        {
          id: "save",
          label: "Save",
          icon: "💾",
          onClick: () => console.log("Save"),
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      icon: "✏️",
      children: [
        {
          id: "cut",
          label: "Cut",
          icon: "✂️",
          onClick: () => console.log("Cut"),
        },
        {
          id: "copy",
          label: "Copy",
          icon: "📋",
          onClick: () => console.log("Copy"),
        },
        {
          id: "paste",
          label: "Paste",
          icon: "📌",
          onClick: () => console.log("Paste"),
        },
      ],
    },
    {
      id: "delete",
      label: "Delete",
      icon: "🗑️",
      danger: true,
      onClick: () => console.log("Delete"),
    },
    { id: "disabled", label: "Disabled Option", icon: "🚫", disabled: true },
  ];

  const [isCommandSearchOpen, setCommandSearchOpen] = useState(false);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setShowMenu(true);
  };

  const menuItems = [
    {
      id: "file",
      label: "File",
      children: [
        {
          id: "new",
          label: "New",
          icon: "📄",
          children: [
            {
              id: "document",
              label: "Document",
              icon: "📝",
              onClick: () => console.log("New document"),
            },
            {
              id: "spreadsheet",
              label: "Spreadsheet",
              icon: "📊",
              onClick: () => console.log("New spreadsheet"),
            },
            {
              id: "presentation",
              label: "Presentation",
              icon: "📊",
              onClick: () => console.log("New presentation"),
            },
          ],
        },
        {
          id: "open",
          label: "Open...",
          icon: "📂",
          shortcut: "⌘O",
          onClick: () => console.log("Open"),
        },
        {
          id: "save",
          label: "Save",
          icon: "💾",
          shortcut: "⌘S",
          onClick: () => console.log("Save"),
        },
        { separator: true },
        {
          id: "print",
          label: "Print...",
          icon: "🖨️",
          shortcut: "⌘P",
          onClick: () => console.log("Print"),
        },
        { separator: true },
        { id: "exit", label: "Exit", onClick: () => console.log("Exit") },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      children: [
        {
          id: "undo",
          label: "Undo",
          icon: "↩️",
          shortcut: "⌘Z",
          onClick: () => console.log("Undo"),
        },
        {
          id: "redo",
          label: "Redo",
          icon: "↪️",
          shortcut: "⌘Y",
          onClick: () => console.log("Redo"),
        },
        { separator: true },
        {
          id: "cut",
          label: "Cut",
          icon: "✂️",
          shortcut: "⌘X",
          onClick: () => console.log("Cut"),
        },
        {
          id: "copy",
          label: "Copy",
          icon: "📋",
          shortcut: "⌘C",
          onClick: () => console.log("Copy"),
        },
        {
          id: "paste",
          label: "Paste",
          icon: "📌",
          shortcut: "⌘V",
          onClick: () => console.log("Paste"),
        },
      ],
    },
    {
      id: "view",
      label: "View",
      children: [
        {
          id: "zoom",
          label: "Zoom",
          icon: "🔍",
          children: [
            {
              id: "zoom-in",
              label: "Zoom In",
              shortcut: "⌘+",
              onClick: () => console.log("Zoom in"),
            },
            {
              id: "zoom-out",
              label: "Zoom Out",
              shortcut: "⌘-",
              onClick: () => console.log("Zoom out"),
            },
            {
              id: "reset-zoom",
              label: "Reset Zoom",
              shortcut: "⌘0",
              onClick: () => console.log("Reset zoom"),
            },
          ],
        },
        { separator: true },
        {
          id: "toolbars",
          label: "Toolbars",
          children: [
            {
              id: "show-main",
              label: "Main Toolbar",
              onClick: () => console.log("Toggle main toolbar"),
            },
            {
              id: "show-status",
              label: "Status Bar",
              onClick: () => console.log("Toggle status bar"),
            },
          ],
        },
        {
          id: "fullscreen",
          label: "Full Screen",
          shortcut: "F11",
          onClick: () => console.log("Toggle fullscreen"),
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      children: [
        {
          id: "documentation",
          label: "Documentation",
          icon: "📚",
          onClick: () => console.log("Open docs"),
        },
        {
          id: "shortcuts",
          label: "Keyboard Shortcuts",
          icon: "⌨️",
          onClick: () => console.log("Show shortcuts"),
        },
        { separator: true },
        {
          id: "about",
          label: "About",
          icon: "ℹ️",
          onClick: () => console.log("Show about"),
        },
      ],
    },
  ];

  const config: SplitConfig[] = [
    {
      id: "1",
      size: 30,
      children: [
        {
          id: "1-1",
          size: 60,
          component: <div className="content">Top Left</div>,
        },
        {
          id: "1-2",
          size: 40,
          component: <div className="content">Bottom Left</div>,
        },
      ],
    },
    {
      id: "2",
      size: 40,
      component: <div className="content">Middle</div>,
    },
    {
      id: "3",
      size: 30,
      children: [
        {
          id: "3-1",
          size: 50,
          component: <div className="content">Top Right</div>,
        },
        {
          id: "3-2",
          size: 50,
          component: <div className="content">Bottom Right</div>,
        },
      ],
    },
  ];

  const handleLayoutChange = (newConfig: SplitConfig[]) => {
    console.log("Layout updated:", newConfig);
  };

  return (
    <>
      <ToastProvider>
        <SonnerProvider position="bottom-right">
          <DraggableElement
            initialPosition={{ x: 100, y: 100 }}
            restrictAxis="x"
            bounds={{ left: 0, right: 500 }}
            onDragEnd={(position) => console.log("Final position:", position)}
          >
            <div
              style={{ padding: "20px", background: "#007bff", color: "white" }}
            >
              Drag me!
            </div>
          </DraggableElement>
          <img className="logo" src={logo} />
          <Switch />
          <Checkbox />
          <DropdownExample />
          <MultiselectExample />
          <DatePicker
            onDateSelect={handleDateSelect}
            initialDate={new Date()} // optional
          />
          <DateRangePicker
            onRangeSelect={handleRangeSelect}
            initialStartDate={new Date()} // optional
            initialEndDate={new Date()} // optional
          />
          <Breadcrumb
            items={breadcrumbItems}
            maxItems={4}
            onNavigate={handleNavigate}
            homeIcon={Home}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Vertical group */}
            <RadioGroup
              name="group1"
              label="Vertical Layout Group"
              value={value1}
              onChange={setValue1}
              size="medium"
            >
              <RadioGroup.Radio value="option1" label="Option 1" />
              <RadioGroup.Radio value="option2" label="Option 2" />
              <RadioGroup.Radio value="option3" label="Option 3" />
            </RadioGroup>

            {/* Horizontal group */}
            <RadioGroup
              name="group2"
              label="Horizontal Layout Group"
              value={value2}
              onChange={setValue2}
              horizontal
              size="medium"
            >
              <RadioGroup.Radio value="choice1" label="Choice 1" />
              <RadioGroup.Radio value="choice2" label="Choice 2" />
              <RadioGroup.Radio value="choice3" label="Choice 3" />
            </RadioGroup>

            {/* Another vertical group */}
            <RadioGroup
              name="group3"
              label="Another Vertical Group"
              value={value3}
              onChange={setValue3}
              size="large"
            >
              <RadioGroup.Radio
                value="item1"
                label="Item 1"
                description="Description for item 1"
              />
              <RadioGroup.Radio
                value="item2"
                label="Item 2"
                description="Description for item 2"
              />
            </RadioGroup>
          </div>
          <div style={{ padding: "20px" }}>
            {/* Default Tabs */}
            <Tabs
              defaultTab={0}
              onChange={handleTabChange}
              variant="default"
              size="medium"
            >
              <Tabs.TabList>
                <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
                <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
                <Tabs.Tab index={2} disabled>
                  Tab 3
                </Tabs.Tab>
              </Tabs.TabList>

              <Tabs.TabPanels>
                <Tabs.TabPanel index={0}>Content for Tab 1</Tabs.TabPanel>
                <Tabs.TabPanel index={1}>Content for Tab 2</Tabs.TabPanel>
                <Tabs.TabPanel index={2}>Content for Tab 3</Tabs.TabPanel>
              </Tabs.TabPanels>
            </Tabs>

            {/* Pills Variant */}
            <Tabs defaultTab={0} variant="pills" size="small" align="center">
              <Tabs.TabList>
                <Tabs.Tab index={0}>Option 1</Tabs.Tab>
                <Tabs.Tab index={1}>Option 2</Tabs.Tab>
                <Tabs.Tab index={2}>Option 3</Tabs.Tab>
              </Tabs.TabList>

              <Tabs.TabPanels>
                <Tabs.TabPanel index={0}>Content for Option 1</Tabs.TabPanel>
                <Tabs.TabPanel index={1}>Content for Option 2</Tabs.TabPanel>
                <Tabs.TabPanel index={2}>Content for Option 3</Tabs.TabPanel>
              </Tabs.TabPanels>
            </Tabs>
          </div>
          <div>
            {/* Basic usage */}
            <ToggleButton label="Basic Toggle" />

            {/* With all props */}
            <ToggleButton
              label="Custom Toggle"
              initialState={true}
              disabled={false}
              onChange={handleChange}
              size="large"
              className="custom-toggle"
            />
          </div>
          <div style={{ padding: "20px" }}>
            <FormatToggleGroup
              initialStates={{
                bold: false,
                italic: false,
                underline: false,
              }}
              onChange={handleFormatChange}
            />
          </div>
          <div style={{ padding: "20px", maxWidth: "600px" }}>
            {/* Basic usage */}
            <ExpandablePanel title="Basic Section">
              <p>This is the content of the expandable panel.</p>
            </ExpandablePanel>

            {/* With icon */}
            <ExpandablePanel
              title="Settings"
              icon={<Settings size={18} />}
              isInitiallyExpanded={true}
            >
              <div>
                <h3>Settings Content</h3>
                <p>You can put any content here, including:</p>
                <ul>
                  <li>Forms</li>
                  <li>Lists</li>
                  <li>Other components</li>
                </ul>
              </div>
            </ExpandablePanel>

            {/* Multiple panels */}
            <ExpandablePanel title="Users" icon={<Users size={18} />}>
              <div>User management content goes here...</div>
            </ExpandablePanel>

            <ExpandablePanel title="Notifications" icon={<Bell size={18} />}>
              <div>Notification settings content goes here...</div>
            </ExpandablePanel>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            siblingCount={1}
            showFirstLast={true}
            showPageSize={true}
            pageSizeOptions={[10, 20, 50, 100]}
            className="custom-pagination"
          />
          <div style={{ padding: "100px", display: "flex", gap: "20px" }}>
            {/* Basic usage */}
            <Tooltip content="Basic tooltip">
              <button>Hover me</button>
            </Tooltip>

            {/* Different positions */}
            <Tooltip content="Top tooltip" position="top">
              <button>Top</button>
            </Tooltip>

            <Tooltip content="Bottom tooltip" position="bottom">
              <button>Bottom</button>
            </Tooltip>

            {/* Different themes */}
            <Tooltip content="Dark theme" theme="dark">
              <button>Dark</button>
            </Tooltip>

            <Tooltip content="Light theme" theme="light">
              <button>Light</button>
            </Tooltip>

            {/* Interactive tooltip */}
            <Tooltip
              content={
                <div>
                  <h3>Interactive Tooltip</h3>
                  <p>You can hover over this tooltip!</p>
                  <button onClick={() => alert("Clicked!")}>Click me</button>
                </div>
              }
              interactive={true}
              maxWidth={300}
            >
              <button>Interactive</button>
            </Tooltip>

            {/* Different triggers */}
            <Tooltip content="Click to show" trigger="click">
              <button>Click trigger</button>
            </Tooltip>
          </div>
          <Toast />
          <div style={{ padding: "20px", maxWidth: "600px" }}>
            {/* Basic usage */}
            <Accordion items={accordionItems} onChange={handleChange} />

            {/* With multiple expansion allowed */}
            <Accordion
              items={accordionItems}
              allowMultiple={true}
              defaultExpanded={["1"]}
              variant="flat"
              iconType="plus"
            />

            {/* Minimal variant */}
            <Accordion
              items={accordionItems}
              variant="minimal"
              bordered={false}
            />
          </div>
          <div>
            // Basic usage
            <RangeSlider
              min={0}
              max={100}
              defaultValue={50}
              label="Volume"
              onChange={(value) => console.log(value)}
            />
            // With theme
            <RangeSlider
              theme="success"
              min={0}
              max={1000}
              step={10}
              defaultValue={500}
              label="Price Range"
            />
            // Disabled state
            <RangeSlider
              disabled
              min={0}
              max={100}
              defaultValue={30}
              label="Disabled Slider"
            />
          </div>
          <DualRangeSlider
            min={0}
            max={1000}
            step={10}
            defaultMinValue={200}
            defaultMaxValue={800}
            label="Price Range"
            onChange={({ min, max }) => console.log(`Range: ${min} - ${max}`)}
            theme="primary"
          />
          <>
            <button onClick={() => setIsOpen(true)}>Open Dialog</button>

            <AlertDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              variant="success"
              title="Operation Successful"
              description="Your changes have been saved successfully."
              actions={
                <>
                  <button
                    className="alert-dialog__button--secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="alert-dialog__button--primary"
                    onClick={() => {
                      // Handle confirmation
                      setIsOpen(false);
                    }}
                  >
                    Confirm
                  </button>
                </>
              }
            />
          </>
          <div style={{ padding: "2rem" }}>
            {/* Basic usage */}
            <ProgressBar value={75} />

            {/* With custom styling */}
            <ProgressBar
              value={60}
              variant="success"
              size="large"
              striped
              animated
              label="Uploading..."
            />

            {/* Indeterminate progress */}
            <ProgressBar indeterminate variant="primary" label="Loading..." />

            {/* Custom thickness with inner label */}
            <ProgressBar
              value={85}
              thickness="thick"
              labelPosition="inner"
              variant="warning"
            />

            {/* Error state */}
            <ProgressBar value={30} status="error" label="Failed to upload" />
          </div>
          <>
            <button onClick={() => setSheetOpen(true)}>Open Sheet</button>

            <Sheet
              isOpen={isSheetOpen}
              onClose={() => setSheetOpen(false)}
              position="right"
              size="medium"
              header={
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Sheet Title</h2>
                </div>
              }
              footer={
                <div className="flex justify-end gap-3">
                  <button onClick={() => setSheetOpen(false)}>Cancel</button>
                  <button className="primary">Save</button>
                </div>
              }
            >
              <div>
                {/* Your sheet content here */}
                <p>This is the sheet content</p>
              </div>
            </Sheet>
          </>
          <>
            <button onClick={() => setDrawerOpen(true)}>Open Drawer</button>

            <Drawer
              isDrawerOpen={isDrawerOpen}
              setDrawerOpen={setDrawerOpen}
              drawerHeight="50vh"
              drawerHeader={
                <h2 className="text-xl font-semibold">Drawer Title</h2>
              }
              drawerFooter={
                <div className="flex justify-end gap-3">
                  <button onClick={() => setDrawerOpen(false)}>Cancel</button>
                  <button className="primary">Save</button>
                </div>
              }
            >
              <div>
                <p>Your drawer content here</p>
              </div>
            </Drawer>
          </>
          <Avatar
            src="user-image.jpg"
            alt="John Doe"
            size="large"
            shape="rounded"
            status="online"
            showStatus
            initials="John Doe"
            clickable
            bordered
            onClick={() => console.log("Avatar clicked")}
          />
          <Sonner />
          <>
            // Basic text skeleton
            <Skeleton />
            // Multiple text rows with random widths
            <Skeleton rows={3} randomWidths />
            // Circular avatar skeleton
            <Skeleton variant="circular" width={40} height={40} />
            // Custom card skeleton
            {/* <Skeleton
              variant="rectangular"
              height={200}
              width="100%"
              animation="wave"
            />
            // Dark theme
            <Skeleton dark animation="shimmer" />
            // Group of skeletons
            <SkeletonGroup count={3} gap={16}>
              <Skeleton height={200} />
            </SkeletonGroup>
            // Custom component skeleton
            <Skeleton variant="custom">
              <div style={{ width: 300, height: 200 }}>
                <h2>Custom Content</h2>
                <p>This will be wrapped with skeleton styling</p>
              </div>
            </Skeleton> */}
          </>
          <>
            // Basic usage
            <HoverCard content="This is a hover card" position="top">
              <button>Hover me</button>
            </HoverCard>
            // Advanced usage
            <HoverCard
              content={
                <div>
                  <h3>Custom Content</h3>
                  <p>With rich formatting</p>
                </div>
              }
              position="right"
              openDelay={300}
              closeDelay={200}
              offset={12}
              arrowSize={10}
              width={300}
              showArrow
              animationDuration={250}
              showOnFocus
              className="custom-hover-card"
            >
              <div>Trigger Element</div>
            </HoverCard>
            <Popover
              trigger={<button>Click me</button>}
              position="bottom"
              onSubmit={handleSubmit}
            />
          </>
          <div>
            <button onClick={() => setIsDialogOpen(true)}>Open Dialog</button>

            <Dialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSubmit={handleSubmit}
              title="Custom Dialog"
              size="medium"
            />
          </div>
          <NavigationMenu items={navItems} />;
          <div onContextMenu={handleContextMenu} style={{ height: "20vh" }}>
            {showMenu && (
              <ContextMenu
                options={menuOptions}
                position={menuPosition}
                onClose={() => setShowMenu(false)}
              />
            )}
            <p>Right-click anywhere to open the context menu</p>
          </div>
          {/* <MenuBar items={menuItems} />
          <div className="content"></div> */}
          <div>
            <button onClick={() => setCommandSearchOpen(true)}>
              Open Command Search
            </button>
            <CommandSearch
              isCommandSearchOpen={isCommandSearchOpen}
              setCommandSearchOpen={setCommandSearchOpen}
            />
          </div>
          <Carousel
            items={carouselItems}
            autoPlay={true}
            interval={5000}
            showArrows={true}
            showDots={true}
            showThumbnails={true}
          />
          {/* <div style={{ width: "100vw", height: "100vh" }}>
            <SplitLayout
              config={config}
              direction="horizontal"
              onChange={handleLayoutChange}
            />
          </div> */}
        </SonnerProvider>
      </ToastProvider>
    </>
  );
}

export default App;

// TODO: Add ability to add more split panes as needed
