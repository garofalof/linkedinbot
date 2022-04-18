const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  let origin = 'SFO';
  let destination = 'EWR';
  let date = '05/07/22';
  let timer = 5000;

  function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
  }

  const browser = await puppeteer.launch({ headless: false, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", userDataDir: "/Users/francescogarofalo/Library/Application Support/Google/Chrome/Default" });
  const page = await browser.newPage();
  await page.goto('https://oldmatrix.itasoftware.com/');

  await page.type('[id="cityPair-orig-0"]', origin);
  await delay(timer);
  await page.type('[id="cityPair-dest-0"]', destination);
  await delay(timer);
  await page.type('[id="cityPair-outDate-0"]', date);
  await delay(timer);

  const button = await page.$x("//div[contains(text(), 'One-way')]");
  await button[0].click();
  await delay(timer);

  await page.click('[id="searchButton-0"]');
})();