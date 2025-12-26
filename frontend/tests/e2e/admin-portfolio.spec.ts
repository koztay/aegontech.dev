import { expect, test } from "@playwright/test";

test.describe("admin portfolio", () => {
  test("can submit ingestion form", async ({ page }) => {
    await page.route("**/api/portfolio/ingest", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "mock-id", status: "published", needsAttention: false })
      });
    });

    await page.goto("/admin/portfolio");
    await page.getByLabel(/Admin JWT/i).fill("dummy-jwt");
    await page.getByLabel(/Source URL/i).fill("https://example.com");
    await page.getByLabel(/Type/i).selectOption("app");
    await page.getByLabel(/Mark as featured/i).check();
    await page.getByLabel(/Order rank/i).fill("1");
    await page.getByLabel(/Title override/i).fill("Demo App");
    await page.getByLabel(/Summary override/i).fill("Summary text");
    await page.getByLabel(/Tags \(comma separated\)/i).fill("demo, app");

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText(/Saved/)).toBeVisible();
  });
});
