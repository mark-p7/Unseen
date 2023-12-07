import { test, expect } from "@playwright/test";
import { User } from "./User";
import { myGroup } from "./Group";

// Create instances of User for each test user
const TestUser1 = new User("TestUser1", "wdqp132rt4qtQ#$Tqg");
const TestUser2 = new User("TestUser2", "qweVFDz234@!");
const TestUser3 = new User("TestUser3", "sdBNIR73%2");
const TestUser4 = new User("TestUser69", "sdBNIRdwabe");

test.use({
  ignoreHTTPSErrors: true,
});

test.describe.serial("sequential message and kick users", () => {
  const message = `some message ${(Math.floor(Math.random() * 10000) + 10000)
    .toString()
    .substring(1)}`;
  test("send message as guest", async ({ page }) => {
    //login into host user of group chat
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(TestUser3.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(TestUser3.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: `Username: ${TestUser3.username}` })
    ).toBeVisible();
    //
    //navigate to
    await page.goto("http://localhost:3000/groups");
    await page.getByRole("link", { name: "TestGroups members: 2" }).click();
    await page.getByPlaceholder("Aa").click();
    await page.getByPlaceholder("Aa").fill(`${message}`);
    await page.getByPlaceholder("Aa").press("Enter");
    await expect(page.getByText(`${message}`).first()).toBeVisible();
    //
  });

  test("check message, invite back", async ({ page }) => {
    //login into host user of group chat
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(TestUser4.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(TestUser4.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: `Username: ${TestUser4.username}` })
    ).toBeVisible();
    //
  });
});

test.describe.serial("sequential user test login", () => {
  test("host user login and create group and invite", async ({ page }) => {
    //login into host user of group chat
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(TestUser1.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(TestUser1.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: `Username: ${TestUser1.username}` })
    ).toBeVisible();
    //

    //creating and entering groupchat
    await page.goto("http://localhost:3000/account");
    await page.getByRole("link", { name: "Groups" }).click();
    await page.waitForTimeout(1500); // wait for 500 milliseconds
    await page.getByRole("button", { name: "Create Group" }).click();
    await page.waitForTimeout(1500); // wait for 500 milliseconds
    await page.getByPlaceholder("Group Name").fill(myGroup.name);
    await page.getByRole("button", { name: "Create Group" }).click();
    await page.waitForTimeout(500); // wait for 500 milliseconds
    await page
      .getByRole("link", { name: `${myGroup.name} members: 1` })
      .click();
    await expect(
      page.getByRole("heading", { name: `${myGroup.name}` })
    ).toBeVisible();
    //

    //add memebers to group chat
    await page.waitForTimeout(500); // wait for 500 milliseconds
    await page.getByRole("button", { name: "Add Member" }).click();
    await page.waitForTimeout(500); // wait for 500 milliseconds
    await page.getByPlaceholder("Username").fill(TestUser2.username);
    await page.getByRole("button", { name: "Send Invite" }).click();
    await page.waitForTimeout(1000); // wait for 500 milliseconds
    //
  });

  test("invited user login and accept invite", async ({ page }) => {
    //accept invitation
    //login to inivted user
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(TestUser2.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(TestUser2.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: `Username: ${TestUser2.username}` })
    ).toBeVisible();
    //
    //accept invitation
    await page.goto("http://localhost:3000/account");
    await page.waitForTimeout(500); // wait for 500 milliseconds
    await page.getByRole("button", { name: "View Invitations" }).click();
    await page.waitForTimeout(500); // wait for 500 milliseconds

    const acceptButton = page
      .locator(
        `text="${myGroup.name}" >> xpath=following-sibling::button[contains(@class, "inline-flex items-center justify-center") and text()="Accept"]`
      )
      .first();
    await acceptButton.click();
    await page.getByRole("button", { name: "Close" }).click();
    //

    //check group
    await page.getByRole("link", { name: "Groups" }).click();
    await page
      .getByRole("link", { name: `${myGroup.name} members: 2` })
      .click();
    await expect(
      page.getByRole("heading", { name: `${myGroup.name}` })
    ).toBeVisible();
  });
  test("host user login and delete group chat", async ({ page }) => {
    //login into host user of group chat
    await page.goto("https://localhost:8080/");
    await page.goto("http://localhost:3000/");
    await page.getByPlaceholder("username").click();
    await page.getByPlaceholder("username").fill(TestUser1.username);
    await page.getByPlaceholder("password").click();
    await page.getByPlaceholder("password").fill(TestUser1.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await expect(
      page.getByRole("heading", { name: `Username: ${TestUser1.username}` })
    ).toBeVisible();
    //

    //delete group chat
    await page.goto("http://localhost:3000/groups");
    await page
      .getByRole("link", { name: `${myGroup.name} members: 2` })
      .click();
    await page.getByText("Delete Group").click();

    //check if group is delete
    await page.goto("http://localhost:3000/groups");
    //this need to be opposite of being visiable
    await expect(
      page.getByRole("heading", { name: `${myGroup.name}` })
    ).not.toBeVisible();
  });
});
