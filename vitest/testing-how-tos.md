For "dumb" UI components (presentational components):

- ✅ Unit tests are usually sufficient
- These components typically just:
  - Render based on props
  - Handle simple user interactions
  - Emit events/callbacks

Example of a unit test for a dumb component:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders with correct text and handles clicks", () => {
    const onClickMock = vi.fn();
    render(<Button onClick={onClickMock}>Click Me</Button>);

    const button = screen.getByText("Click Me");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledOnce();
  });
});
```

For "smart" components (containers/features):

- ✅ Integration tests are more valuable because they:
  - Coordinate multiple components
  - Make API calls
  - Manage state
  - Have complex user interactions

Example of an integration test:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UserDashboard from "./UserDashboard";

describe("UserDashboard", () => {
  it("loads user data and updates profile", async () => {
    // Mock API calls
    vi.mock("../api", () => ({
      fetchUserData: () => Promise.resolve({ name: "John" }),
      updateProfile: vi.fn(),
    }));

    render(<UserDashboard />);

    // Wait for data loading
    await screen.findByText("John");

    // Test interaction between components
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.input(screen.getByLabelText("Name"), {
      target: { value: "Jane" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Changes saved!")).toBeInTheDocument();
    });
  });
});
```

For E2E tests:

- ✅ Test at application level
- Focus on critical user journeys like:
  - User registration/login flow
  - Checkout process
  - Core business workflows
- Usually fewer tests but cover more ground

Example of what to E2E test:

```typescript
// Using Playwright
test("complete purchase flow", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Login");
  await page.fill("[name=email]", "user@example.com");
  await page.fill("[name=password]", "password");
  await page.click("text=Sign in");

  // Add item to cart
  await page.click("text=Products");
  await page.click("text=Add to Cart");

  // Complete checkout
  await page.click("text=Checkout");
  await page.fill("[name=card]", "4242424242424242");
  await page.click("text=Place Order");

  await expect(page.locator("text=Order Confirmed")).toBeVisible();
});
```

Testing pyramid recommendation:

- Many unit tests (quick, focused)
- Fewer integration tests (key features)
- Few E2E tests (critical paths)

This approach gives you good coverage while keeping the test suite maintainable and fast to run.
