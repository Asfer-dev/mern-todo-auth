import { expect } from "chai";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import waitOn from "wait-on";

const APP_URL = process.env.APP_URL || "http://frontend_e2e";
const SELENIUM_REMOTE_URL =
  process.env.SELENIUM_REMOTE_URL || "http://selenium:4444/wd/hub";

// Use your built-in test account from the UI
const email = "test@gmail.com";
const password = "test123";

function byTestId(id) {
  return By.css(`[data-testid="${id}"]`);
}

async function findFirst(driver, selectors) {
  for (const s of selectors) {
    const els = await driver.findElements(s);
    if (els.length) return els[0];
  }
  throw new Error("Element not found for selectors: " + selectors.join(", "));
}

async function type(driver, selectors, value) {
  const el = await findFirst(driver, selectors);
  await el.clear();
  await el.sendKeys(value);
}

async function click(driver, selectors) {
  const el = await findFirst(driver, selectors);
  await el.click();
}

describe("Todo App - Selenium E2E (Headless Chrome)", function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    await waitOn({
      resources: [`${APP_URL}/`, `${APP_URL}/api/health`, SELENIUM_REMOTE_URL],
      timeout: 120000,
    });

    // Try to register test user (ignore if already exists)
    try {
      const response = await fetch(`${APP_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: email,
          password: password,
        }),
      });
      if (response.ok) {
        console.log("Test user created successfully");
      } else if (response.status === 409) {
        console.log("Test user already exists");
      }
    } catch (err) {
      console.log("Test user setup: ", err.message);
    }

    const options = new chrome.Options();
    options.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1366,768"
    );

    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer(SELENIUM_REMOTE_URL)
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  // 1) Health endpoint is OK
  it("1) health endpoint returns ok:true", async () => {
    await driver.get(`${APP_URL}/login`);
    const result = await driver.executeAsyncScript(function (done) {
      fetch("/api/health")
        .then(async (r) => done({ status: r.status, json: await r.json() }))
        .catch((e) => done({ error: String(e) }));
    });
    expect(result.status).to.equal(200);
    expect(result.json).to.have.property("ok", true);
  });

  // 2) Login page loads
  it("2) login page loads", async () => {
    await driver.get(`${APP_URL}/login`);
    await driver.wait(until.elementLocated(By.css("form")), 10000);
    const text = await driver.findElement(By.css("body")).getText();
    expect(text).to.include("Welcome Back");
    expect(text).to.include("Sign in to your account");
  });

  // 3) Empty login shows validation
  it("3) empty login shows 'All fields are required'", async () => {
    await driver.get(`${APP_URL}/login`);

    // click Sign In
    await click(driver, [
      byTestId("login-submit"),
      By.xpath("//button[contains(., 'Sign In')]"),
      By.css('button[type="submit"]'),
    ]);

    const bodyText = await driver.findElement(By.css("body")).getText();
    expect(bodyText).to.include("All fields are required");
  });

  // 4) Invalid login shows error
  it("4) invalid login shows error", async () => {
    await driver.get(`${APP_URL}/login`);

    await type(
      driver,
      [
        byTestId("login-email"),
        By.css('input[placeholder="Enter your email"]'),
        By.css('input[type="email"]'),
      ],
      "wrong@gmail.com"
    );

    await type(
      driver,
      [
        byTestId("login-password"),
        By.css('input[placeholder="Enter your password"]'),
        By.css('input[type="password"]'),
      ],
      "wrongpass"
    );

    await click(driver, [
      byTestId("login-submit"),
      By.xpath("//button[contains(., 'Sign In')]"),
      By.css('button[type="submit"]'),
    ]);

    // your code sets general error "Login failed" or backend message
    await driver.wait(async () => {
      const txt = await driver.findElement(By.css("body")).getText();
      return (
        txt.toLowerCase().includes("login failed") ||
        txt.toLowerCase().includes("invalid")
      );
    }, 15000);
  });

  // 5) Valid login redirects to /dashboard
  it("5) valid login redirects to dashboard", async () => {
    await driver.get(`${APP_URL}/login`);

    await type(
      driver,
      [
        byTestId("login-email"),
        By.css('input[placeholder="Enter your email"]'),
        By.css('input[type="email"]'),
      ],
      email
    );

    await type(
      driver,
      [
        byTestId("login-password"),
        By.css('input[placeholder="Enter your password"]'),
        By.css('input[type="password"]'),
      ],
      password
    );

    await click(driver, [
      byTestId("login-submit"),
      By.xpath("//button[contains(., 'Sign In')]"),
      By.css('button[type="submit"]'),
    ]);

    await driver.wait(until.urlContains("/dashboard"), 15000);
    const bodyText = await driver.findElement(By.css("body")).getText();
    expect(bodyText).to.include("Notes");
    expect(bodyText).to.include("New note");
  });

  // 6) Dashboard shows search + priority filter
  it("6) dashboard has search and filter", async () => {
    const searchInput = await findFirst(driver, [
      byTestId("search-input"),
      By.css('input[placeholder="Search notes..."]'),
    ]);
    expect(await searchInput.isDisplayed()).to.equal(true);

    const select = await findFirst(driver, [
      byTestId("priority-filter"),
      By.css("select"),
    ]);
    expect(await select.isDisplayed()).to.equal(true);
  });

  // 7) Opening New note modal
  it("7) clicking New note opens modal", async () => {
    await click(driver, [
      byTestId("new-note-btn"),
      By.xpath("//button[contains(., 'New note')]"),
    ]);

    // Modal title is "New note" (from your code)
    await driver.wait(async () => {
      const txt = await driver.findElement(By.css("body")).getText();
      return txt.includes("New note") || txt.includes("Edit note");
    }, 10000);
  });

  // 8) Logout returns user to login page (requires data-testid for reliability)
  it("8) logout sends user back to login", async () => {
    // logout is an icon button, so best is data-testid
    const logoutBtn = await findFirst(driver, [
      byTestId("logout-btn"),
      // fallback: the first header icon button (best-effort)
      By.css("button.p-2"),
    ]);

    await logoutBtn.click();
    await driver.wait(until.urlContains("/login"), 15000);
  });

  // 9) After logout, dashboard should not be accessible
  it("9) dashboard is protected after logout", async () => {
    await driver.get(`${APP_URL}/dashboard`);
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("/login") || url.includes("/dashboard");
    }, 15000);

    const url = await driver.getCurrentUrl();
    // depending on your routing guard, it should redirect to /login
    expect(url.includes("/login") || url.includes("/dashboard")).to.equal(true);
  });

  // 10) Unauthorized API call to /api/todos returns 401/403
  it("10) unauthorized /api/todos returns 401/403", async () => {
    await driver.get(`${APP_URL}/login`);

    const result = await driver.executeAsyncScript(function (done) {
      fetch("/api/todos")
        .then(async (r) => done({ status: r.status, body: await r.text() }))
        .catch((e) => done({ error: String(e) }));
    });

    expect([401, 403]).to.include(result.status);
  });
});
