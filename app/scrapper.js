const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const scrapeData = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://themoviesflix.beer/');

        const links = await page.$$eval('a', elements => elements.map(el => el.href).filter(href => href));
        const results = [];

        for (const link of links) {
            try {
                await page.goto(link);

                const categories = await page.$$eval('div.thecategory a', elements => elements.map(el => el.href));
                const imgSrc = await page.$eval('div.post-single-content img', el => el.src);
                const downloadLinks = await page.$$eval('h3 a', elements => elements.map(el => el.href));

                const allDownloadLinks = [];

                for (const downloadLink of downloadLinks) {
                    try {
                        await page.goto(downloadLink);
                        const subDownloadLinks = await page.$$eval('div.view-links a', elements => elements.map(el => el.href));
                        allDownloadLinks.push({ downloadLink, subLinks: subDownloadLinks });
                    } catch (error) {
                        console.error(`Error fetching download link ${downloadLink}: ${error.message}`);
                    }
                }

                results.push({ url: link, categories, imgSrc, downloadLinks: allDownloadLinks });
                console.log(`Scraped data from: ${link}`);
            } catch (error) {
                console.error(`Error fetching page ${link}: ${error.message}`);
            }
        }

        // Clear the previous data and save new results to JSON file
        const filePath = path.join(process.cwd(), 'data', 'scrapedData.json');
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2)); // Overwrite the file
        console.log('Previous data cleared and new data saved to scrapedData.json');
    } catch (error) {
        console.error(`Error fetching main page: ${error.message}`);
    } finally {
        await browser.close();
    }
};

module.exports = scrapeData;
