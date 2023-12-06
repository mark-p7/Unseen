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
    await expect(page).toHaveURL("http://localhost:3000/register");
    await page.getByPlaceholder("Username").click();
    await page.getByPlaceholder("Username").fill(sharedUser.username);
    await page.getByPlaceholder("Password", { exact: true }).click();
    await page
      .getByPlaceholder("Password", { exact: true })
      .fill(sharedUser.password);
    await page.getByPlaceholder("Confirm Password").click();
    await page.getByPlaceholder("Confirm Password").fill(sharedUser.password);
    await page.getByRole("button", { name: "Register →" }).click();
    await page.getByRole('link', { name: 'Account' }).click();
    await expect(
      page.getByRole('heading', { name: `Username: ${sharedUser.username}` })
    ).toBeVisible();
    // await page.getByRole("button", { name: "Logout" }).click();
  });

  test("shared user login and delete account", async ({ page }) => {
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(sharedUser.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(sharedUser.password);
    await page.getByRole("button", { name: "Login" }).click();

    await page.getByRole('link', { name: 'Account' }).click();
    await expect(
      page.getByRole('heading', { name: `Username: ${sharedUser.username}` })
    ).toBeVisible();

    //Delete user here
    await page.goto("http://localhost:3000/account"); // this need to have a button in the future
    await expect(page).toHaveURL("http://localhost:3000/account");
    await page.waitForTimeout(1000); // waits for 1 second
    await page.getByRole("heading", { name: "Delete Account" }).click();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});
