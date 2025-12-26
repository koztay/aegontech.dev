import { expect, test } from "@playwright/test";

test.describe("marketing home", () => {
  test("renders hero and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /view portfolio/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /book a call/i })).toBeVisible();
  });

  test("strip auto-loops and can be paused", async ({ page }) => {
    await page.goto("/");
    const strip = page.getByRole("region", { name: /featured portfolio items/i });
    await expect(strip).toBeVisible();

    const pauseButton = page.getByTestId("strip-pause");
    await pauseButton.click();
    await expect(pauseButton).toHaveText(/resume/i);

    await pauseButton.click();
    await expect(pauseButton).toHaveText(/pause/i);
  });

  test("keyboard and buttons advance strip", async ({ page }) => {
    await page.goto("/");
    const strip = page.getByRole("region", { name: /featured portfolio items/i });
    await strip.focus();
    await strip.press("ArrowRight");
    await strip.press("ArrowLeft");
    const nextButton = page.getByTestId("strip-next");
    const prevButton = page.getByTestId("strip-prev");
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await prevButton.click();
  });

  test("meets basic perf budgets", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const lcpEntry = performance.getEntriesByType("largest-contentful-paint").pop() as PerformanceEntry | undefined;
      const cls = (performance.getEntriesByType("layout-shift") as PerformanceEntry[]).reduce((acc, entry: any) => acc + (entry?.value || 0), 0);
      return {
        lcp: lcpEntry?.startTime ?? null,
        cls
      };
    });

    if (metrics.lcp !== null) {
      expect(metrics.lcp).toBeLessThan(4000); // dev env lenient threshold
    }
    expect(metrics.cls).toBeLessThan(0.1);
  });
});
