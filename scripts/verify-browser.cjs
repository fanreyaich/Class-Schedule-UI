const { chromium } = require("playwright");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const pages = ["index.html", "dashboard.html", "focus.html", "classic.html", "semester.html", "progress.html"];

(async () => {
  const context = await chromium.launchPersistentContext(path.join(root, "artifacts", "browser-check"), {
    channel: "msedge",
    headless: true,
    viewport: { width: 390, height: 844 }
  });
  await context.addInitScript(() => localStorage.clear());
  const failures = [];
  try {
    for (const pageName of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(root, pageName)).href, { waitUntil: "load" });
      await page.waitForTimeout(150);
      const bodyText = await page.locator("body").innerText();
      if (!await page.title().then(title => title.includes("课表空白模板"))) failures.push(`${pageName}: missing template title`);
      if (bodyText.includes("undefined") || bodyText.includes("NaN")) failures.push(`${pageName}: invalid placeholder`);
      if (errors.length) failures.push(`${pageName}: ${errors.join(" | ")}`);
      await page.close();
    }

    const focus = await context.newPage();
    await focus.goto(pathToFileURL(path.join(root, "focus.html")).href, { waitUntil: "load" });
    if (!(await focus.locator("body").innerText()).includes("尚未配置课程")) failures.push("focus: expected blank state");
    const button = focus.getByText("体验10分钟计时");
    if (!await button.count()) failures.push("focus: demo button missing");
    else {
      await button.click();
      await focus.waitForTimeout(50);
      if (!(await focus.locator("body").innerText()).includes("专注体验 · 演示")) failures.push("focus: demo timer did not start");
    }
    await focus.close();
  } finally {
    await context.close();
  }
  if (failures.length) throw new Error(failures.join("\n"));
  console.log("browser_blank_template_ok");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
