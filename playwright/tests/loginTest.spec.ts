import { test, expect } from "@playwright/test";
import { User } from "./User";
import { myGroup } from "./Group";

// Create instances of User for each test user
const TestUser1 = new User("TestUser1", "wdqp132rt4qtQ#$Tqg");
const TestUser2 = new User("TestUser2", "qweVFDz234@!");
const TestUser3 = new User("TestUser3", "sdBNIR73%2");

test.use({
  ignoreHTTPSErrors: true,
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
    await page.waitForTimeout(500); // wait for 500 milliseconds
    await page.getByRole("button", { name: "Create Group" }).click();
    await page.waitForTimeout(500); // wait for 500 milliseconds
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
  test("inited user login and accept invite", async ({ page }) => {
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

    // await page.getByRole("button", { name: "Accept" }).click();
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
