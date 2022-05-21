import puppeteer from 'puppeteer';
import fs from 'fs';
import 'dotenv/config';

const username = process.env.USERNAME || '';
const password = process.env.PASSWORD || '';
const company = process.env.COMPANY || '';



async function getData(username, password, company) {
  const browser = await puppeteer.launch({ headless: false, userDataDir: "./user_data" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  await page.goto('https://linkedin.com');
  await page.waitForTimeout(1000);
  const [userInput] = await page.$x('//*[@id="session_key"]');
  if (userInput) {
    await userInput.type(username);
    await page.waitForTimeout(250);
    const [passwordInput] = await page.$x('/html/body/main/section[1]/div/div/form/div[2]/div[2]/input');
    await passwordInput.type(password);
    const [loginButton] = await page.$x('/html/body/main/section[1]/div/div/form/button');
    await page.waitForTimeout(250);
    await loginButton.click();
  }
  await page.waitForSelector('#global-nav-typeahead > input');
  await page.waitForTimeout(250);
  await page.click('#global-nav-typeahead > input');
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
    let all = [...document.querySelectorAll('.app-aware-link')];
    let filtered = all.filter((e) => e.innerText.trim().includes('View'));
    let links = filtered.map((e) => e.href);
    let names = filtered.map((e) => {
      let str = e.innerText.trim();
      let splitStr = str.split('\n');
      return splitStr[0];
    });
    let titles = [...document.querySelectorAll('.entity-result__primary-subtitle')];
    let titlesText = titles.map((e) => {
      let text = e.innerText.trim();
      let splitText = text.split(' at');
      return splitText[0];
    });
    let result = names.map((name, index) => {
      return {name, position: titlesText[index], link: links[index]}
    });
    return result;
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
        let all = [...document.querySelectorAll('.app-aware-link')];
        let filtered = all.filter((e) => e.innerText.trim().includes('View'));
        let links = filtered.map((e) => e.href);
        let names = filtered.map((e) => {
          let str = e.innerText.trim();
          let splitStr = str.split('\n');
          return splitStr[0];
        });
        let titles = [...document.querySelectorAll('.entity-result__primary-subtitle')];
        let titlesText = titles.map((e) => {
          let text = e.innerText.trim();
          let splitText = text.split(' at');
          return splitText[0];
        });
        let result = names.map((name, index) => {
          return {name, position: titlesText[index], link: links[index]}
        });
        return result;
      });
      results = [...results, ...newResults];
    } catch (err) {
      break;
    }
  }
  const final = results.map((result) => {
    let temp = result;
    temp.company = company;
    return temp;
  });
  await browser.close();
  return final;
}

const data = await getData(username, password, company);

let writeStream = fs.createWriteStream(`./${company}.csv`);

data.forEach((result, index) => {
    let newLine = [];
    newLine.push(result.name);
    newLine.push(result.position);
    newLine.push(result.link);
    newLine.push(result.company);
    writeStream.write(newLine.join(',')+ '\n', () => {
      console.log(newLine, ' written to stream');
    });
});

// writeStream.end();

writeStream.on('finish', () => {
    console.log('finish write stream, moving along')
}).on('error', (err) => {
    console.log(err)
});