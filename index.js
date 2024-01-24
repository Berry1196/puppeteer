const puppeteer = require("puppeteer");
const fs = require("fs");
const cookiesFilePath = "cookies.json";

async function saveCookies(page) {
  const cookies = await page.cookies();
  fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
}

async function loadCookies(page) {
  if (fs.existsSync(cookiesFilePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesFilePath));
    await page.setCookie(...cookies);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await loadCookies(page);

  await page.goto("https://www.cphbusiness.dk/", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "cp.png" });

  const declineButton = await page.$("#declineButton");
  if (declineButton) {
    await page.waitForSelector("#declineButton");
    await declineButton.click();
    await saveCookies(page);
  }

  await page.screenshot({ path: "cph2.png" });
  await browser.close();
})();
