const puppeteer = require('puppeteer');

const username = 'fgarofalo1493@gmail.com';
const password = 'Focus@2020';
const company = 'Google';

async function getData(username, password, company) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://linkedin.com');
  await page.waitForXPath('//*[@id="session_key"]');
  const [userInput] = await page.$x('//*[@id="session_key"]');
  await userInput.type(username);
  await page.waitForTimeout(250);
  const [passwordInput] = await page.$x('/html/body/main/section[1]/div/div/form/div[2]/div[2]/input');
  await passwordInput.type(password);
  const [loginButton] = await page.$x('/html/body/main/section[1]/div/div/form/button');
  await page.waitForTimeout(250);
  await loginButton.click();
  await page.waitForSelector('#global-nav-search > div > button > li-icon > svg');
  await page.waitForTimeout(250);
  await page.click('#global-nav-search > div > button > li-icon > svg');
  await page.waitForTimeout(100);
  await page.keyboard.press('Enter');
  await page.waitForSelector('#search-reusables__filters-bar > ul > li:nth-child(1) > button');
  await page.waitForTimeout(250);
  await page.click('#search-reusables__filters-bar > ul > li:nth-child(1) > button');
  await page.waitForSelector('.relative.mr2 button');
  await page.waitForTimeout(250);
  await page.click('.relative.mr2 button');
  await page.waitForSelector('.search-reusables__secondary-filters-values');
  await page.evaluate(async () => {
    let elements = [...document.querySelectorAll('.artdeco-button span')];
    let buttons = elements.filter((e) => e.innerText.trim() === 'Add a company');
    await buttons[0].click();
  });
  await page.waitForSelector('[placeholder="Add a company"]');
  const companyInput = await page.$('[placeholder="Add a company"]');
  await companyInput.type(company);
  await page.waitForSelector('.search-typeahead-v2__hit-info.display-flex.flex-column');
  await page.waitForTimeout(500);
  await page.evaluate(async () => {
    let results = [...document.querySelectorAll('.search-typeahead-v2__hit-info.display-flex.flex-column')];
    await results[0].click();
  });
  await page.waitForSelector('.search-reusables__secondary-filters-values');
  await page.waitForTimeout(250);
  await page.evaluate(async () => {
    let elements = [...document.querySelectorAll('.artdeco-button span')];
    let buttons = elements.filter((e) => e.innerText.trim() === 'Add a school');
    await buttons[0].click();
  });
  await page.waitForSelector('[placeholder="Add a school"]');
  const schoolInput = await page.$('[placeholder="Add a school"]');
  await page.waitForTimeout(250);
  await schoolInput.type('Hack Reactor');
  await page.waitForTimeout(750);
  await page.waitForSelector('.search-typeahead-v2__hit-info.display-flex.flex-column');
  await page.evaluate(async () => {
    let results = [...document.querySelectorAll('.search-typeahead-v2__hit-info.display-flex.flex-column')];
    await results[0].click();
  });
  await page.waitForSelector('.reusable-search-filters-buttons span');
  await page.waitForTimeout(250);
  await page.click('.reusable-search-filters-buttons span');
  await page.waitForSelector('.app-aware-link span span');
  let results = await page.evaluate(() => {
    let spans = [...document.querySelectorAll('.app-aware-link span span')];
    let people = spans.map((person) => person.innerText.trim()).filter((element, index) => index % 2 === 0);
    return people;
  });
  const url = await page.url();
  const splitUrl = url.split('&school');
  let counter = 2;
  while (counter <= 10) {
    const newUrl = splitUrl[0] + `&page=${counter}&school` + splitUrl[1];
    counter++;
    try {
      await page.goto(newUrl);
      await page.waitForSelector('.app-aware-link span span', { timeout: 5000});
      const newResults = await page.evaluate(() => {
        let spans = [...document.querySelectorAll('.app-aware-link span span')];
        let people = spans.map((person) => person.innerText.trim()).filter((element, index) => index % 2 === 0);
        return people;
      });
      results = [...results, ...newResults];
    } catch (err) {
      break;
    }
  }
  const resultObj = { company, results };
  console.log(resultObj);
}

getData(username, password, company);