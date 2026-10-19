import { expect, test } from "@playwright/test";

test("dashboard exposes primary school workflows", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /good afternoon/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /add student/i })).toBeVisible();
});

test("mobile attendance has no horizontal overflow", async ({ page }) => {
  await page.goto("/dashboard/attendance");
  await expect(page.getByRole("heading", { name: "Attendance" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

