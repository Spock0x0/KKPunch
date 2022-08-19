const puppeteer = require('puppeteer')
const fs = require("fs")
const cron = require('node-cron');
const randomCrom = require('random-cron');
const NodeRSA = require('node-rsa');

const punchType = {
    OnDuty: "onDuty",
    OffDuty: "offDuty"
}

function readJsonFile(file) {
    let bufferData = fs.readFileSync(file)
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    return data
}

function readFile(file) {
    let bufferData = fs.readFileSync(file)
    return bufferData.toString()
}

// for owner use, u need private key ha ha...
function encrypt(rawData) {
    fs.readFile('./private.pem', function (err, data) {
      var key = new NodeRSA(data);
      let cipherText = key.encryptPrivate(rawData, 'base64');
      console.log(cipherText);
    });
}

function decrypt(encryptData, path) {    
    const data = readFile(`${path}/public.pem`)
    var key = new NodeRSA(data);
    return key.decryptPublic(encryptData, 'utf8');
}

async function main(type) {
    const apiUrl = decrypt('Uu3txyYpBS2cGOJohOEbxkDC9dheQPqBYUUmR0/mvNnHQXLKOUb7qTyZCBkeAYkWfCsKdPJMfmc+8YxwLEnMV0lPTLzFZk6dH3aGUvw+RtkmqL95HSCfcu0AdIp0fY9SFKF+YLn3yx6InBQ2Le16qj7sGTEBk7RJlEvpP+b7K0RT8X9aOjIs7dM/S/FH9dcXyv0uFJjQ4fBXqSc229CET9ZbtTbaKK0GwazCeXXQFAk5VUCCC2XOVG++6ckdZ3py', './keys/spock')
    const infos = readJsonFile("./config.json")    
    
    for (let info of infos.data) {
        const {username, password, keyPath} = info
        console.log(keyPath);
        try {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
            await page.goto(apiUrl)
            await page.$eval('input[name=username]', (el, value) => el.value = value, decrypt(username, keyPath));
            await page.$eval('input[name=password]', (el, value) => el.value = value, decrypt(password, keyPath));
            const loginButton = await page.$('input[type="image"]', keyPath);
            await loginButton.click();
            await sleep(2000)
            await page.goto(decrypt('Ofy2KzcM2eIFeZax2lS5DvoT9vrMWOqNDbKjv/Yh1eKchNt0XHulvM6EWqZaCgXFaxCrSKA6/fgASRVGAUex/ludSmK+VUcp/HFcmTtS7Wx2g5gSbaNp+Gu2gl/xpdlQsjltAr7aHTjwH5tMRNJkup4g5OdF7vja565ZJxIk5VkHtIeLOB7h7P5b2JCaPPJtJt8O8QAn0DitdNHS0Bs0it6Cb/fICHDuXwHv/P/+p0O9gk01c6ubab+aEWuCegVCb1DUS65n2jfKy4Xf8h1/Y6X9JgfdAQfFfCMX4p/35Xzzr5+rpApvNt9elHePhe1sW5eEZRZg+js2itE26z6ESA==', keyPath))
            if (type == punchType.OnDuty) {
                await page.click('input[name=radiobutton][value="0"]')
            } else {
                await page.click('input[name=radiobutton][value="1"]')
            }            
            const submitButton = await page.$('input[name="Submit2"]');            
            await submitButton.click();
            await sleep(1000)
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

function scheduleing() {
    
    // 每週一到週五上午 9:30 分執行
    cron.schedule('0 30 9 ? * MON-FR', () => {       
        main(punchType.OnDuty)
    });

    // 每週一到週五下午 7:01 分執行
    cron.schedule('0 01 19 ? * MON-FR', () => {        
        main(punchType.OffDuty)
    });
}

// main(punchType.OffDuty);
// encrypt('KK01661')
scheduleing()
// decrypt()