const puppeteer = require('puppeteer')
const fs = require("fs")

function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}

async function main() {
    const apiUrl = 'https://hrm.kkday.net/ehrportal/LoginFOpen.asp'
    const infos = readJsonFile("./config.json")

    for (let info of infos.data) {
        const {username, password} = info
        try {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
            await page.goto(apiUrl)    
            await page.$eval('input[name=username]', (el, value) => el.value = value, username);
            await page.$eval('input[name=password]', (el, value) => el.value = value, password);            
            const loginButton = await page.$('input[type="image"]');
            await loginButton.click();
            await sleep(2000)
            await page.goto("https://hrm.kkday.net/ehrportal//DEPT/Personal_CardData_Default.asp")        
            await page.click('input[name=radiobutton][value="1"]')            
            const submitButton = await page.$('input[name="Submit2"]');
            // await submitButton.click();
            page.close()
        } catch (error) {
          console.log("error", error);
          return
        }
    }        
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

main()