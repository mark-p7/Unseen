// import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

import { test, expect } from "@playwright/test";

// Define User structure
class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
  username;
  password;
}

// Create instances of User for each test user
const TestUser1 = new User("TestUser1", "wdqp132rt4qtQ#$Tqg");
const TestUser2 = new User("TestUser2", "qweVFDz234@!");
const TestUser3 = new User("TestUser3", "sdBNIR73%2");

test.use({
  ignoreHTTPSErrors: true,
});

test("test User 1", async ({ page }) => {
  await page.goto("https://localhost:8080/");
  await page.goto("http://localhost:3000/");
  // await page.goto('http://localhost:3000/login');
  await page.getByPlaceholder("username").click();
  await page.getByPlaceholder("username").fill(TestUser1.username);
  await page.getByPlaceholder("password").click();
  await page.getByPlaceholder("password").fill(TestUser1.password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(
    page.getByRole("heading", { name: TestUser1.username })
  ).toBeVisible();
});

test("test User 2", async ({ page }) => {
  await page.goto("https://localhost:8080/");
  await page.goto("http://localhost:3000/");
  // await page.goto('http://localhost:3000/login');
  await page.getByPlaceholder("username").click();
  await page.getByPlaceholder("username").fill(TestUser2.username);
  await page.getByPlaceholder("password").click();
  await page.getByPlaceholder("password").fill(TestUser2.password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(
    page.getByRole("heading", { name: TestUser2.username })
  ).toBeVisible();
});

test("test User 3", async ({ page }) => {
  await page.goto("https://localhost:8080/");
  await page.goto("http://localhost:3000/");
  // await page.goto('http://localhost:3000/login');
  await page.getByPlaceholder("username").click();
  await page.getByPlaceholder("username").fill(TestUser3.username);
  await page.getByPlaceholder("password").click();
  await page.getByPlaceholder("password").fill(TestUser3.password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(
    page.getByRole("heading", { name: TestUser3.username })
  ).toBeVisible();
});
