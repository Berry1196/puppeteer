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
  await page.screenshot({ path: "cph.png" });

  try {
    const declineButton = await page.$("#declineButton");
    if (declineButton) {
      const isButtonVisible = await page.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }, declineButton);

      if (isButtonVisible) {
        console.log("Decline button is visible. Clicking...");
        await declineButton.click();
        await saveCookies(page);
      } else {
        console.log("Decline button is present but not visible.");
      }
    } else {
      console.log("Decline button not found.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  await page.screenshot({ path: "cph2.png" });
  await browser.close();
})();
