import { expect, test } from "@playwright/test";

test.describe("blog rendering", () => {
  test("renders sample blog with schema and images", async ({ page }) => {
    await page.goto("/blog/sample-post");

    await expect(page.getByTestId("blog-title")).toHaveText(/Shipping Fast/i);
    await expect(page.getByTestId("featured-image")).toBeVisible();
    const inlineImages = page.getByTestId("inline-image");
    await expect(inlineImages).toHaveCount(2);

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toMatch(/Shipping Fast/i);

    const schema = await page.locator('script[type="application/ld+json"]').textContent();
    expect(schema).toContain("Article");
  });

  test("blog index lists posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1, name: /Inside the studio/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Shipping Fast With Clarity/i })).toBeVisible();
  });
});
