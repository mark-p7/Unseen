import { test, expect } from "@playwright/test";
import { User } from "./User";
import { sharedUser } from "./User";

test.use({
  ignoreHTTPSErrors: true,
});

test.describe.serial("sequential user test login logout", () => {
  test("make random user", async ({ page }) => {
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByText("Register →").click();
    await expect(page).toHaveURL('http://localhost:3000/register');
    await page.getByPlaceholder("Username").click();
    await page.getByPlaceholder("Username").fill(sharedUser.username);
    await page.getByPlaceholder("Password", { exact: true }).click();
    await page.getByPlaceholder("Password", { exact: true }).fill(sharedUser.password);
    await page.getByPlaceholder("Confirm Password").click();
    await page.getByPlaceholder("Confirm Password").fill(sharedUser.password);
    await page.getByRole("button", { name: "Register →" }).click();
    await expect(
      page.getByRole("heading", { name: sharedUser.username })
    ).toBeVisible();
    await page.getByRole("button", { name: "Logout" }).click();
  });

  test("shared user login", async ({ page }) => {
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(sharedUser.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(sharedUser.password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByRole("heading", { name: sharedUser.username })
    ).toBeVisible();
  });
});
