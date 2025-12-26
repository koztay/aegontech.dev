import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

vi.mock("@/lib/data/portfolio", () => ({
  getFeaturedPortfolioItems: vi.fn().mockResolvedValue([
    { id: "1", title: "One", summary: "A", type: "web", link: "#", order_rank: 1, image: "/assets/placeholder.svg" },
    { id: "2", title: "Two", summary: "B", type: "app", link: "#", order_rank: 2, image: "/assets/placeholder.svg" },
    { id: "3", title: "Three", summary: "C", type: "web", link: "#", order_rank: 3, image: "/assets/placeholder.svg" }
  ])
}));

import { PortfolioStrip } from "@/components/sections/portfolio-strip";

function mockMatchMedia(prefersReduced: boolean) {
  const mql = {
    matches: prefersReduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  } as unknown as MediaQueryList;
  // @ts-expect-error test shim
  window.matchMedia = () => mql;
  return mql;
}

describe("PortfolioStrip", () => {
  test("renders items and toggles pause", async () => {
    mockMatchMedia(false);
    render(<PortfolioStrip />);

    await waitFor(() => expect(screen.getByRole("region", { name: /featured portfolio items/i })).toBeInTheDocument());
    expect(screen.getAllByRole("link", { name: /one|two|three/i }).length).toBeGreaterThanOrEqual(3);

    const pauseButton = screen.getByRole("button", { name: /pause/i });
    await userEvent.click(pauseButton);
    expect(pauseButton).toHaveAttribute("aria-pressed", "true");
  });

  test("respects reduced motion", async () => {
    mockMatchMedia(true);
    render(<PortfolioStrip />);

    await waitFor(() => expect(screen.getByText(/Animation paused/i)).toBeInTheDocument());
  });
});
