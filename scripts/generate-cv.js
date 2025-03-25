const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const PORTFOLIO_URL = 'https://votre-portfolio.com';
const QR_OUTPUT_PATH = path.join(__dirname, '../src/templates/qr-code.png');
const HTML_TEMPLATE_PATH = path.join(__dirname, '../src/templates/cv-pdf.html');
const PDF_OUTPUT_PATH = path.join(__dirname, '../dist/cv-elie-alves.pdf');

async function generateCV() {
    try {
        // 1. Générer le QR code
        await QRCode.toFile(QR_OUTPUT_PATH, PORTFOLIO_URL, {
            width: 1000,
            margin: 1,
            color: {
                dark: '#2c3e50',
                light: '#ffffff'
            }
        });

        // 2. Lancer le navigateur
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        // 3. Charger le template HTML
        const htmlContent = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf8');
        await page.setContent(htmlContent);

        // 4. Générer le PDF
        await page.pdf({
            path: PDF_OUTPUT_PATH,
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        await browser.close();
        console.log('CV PDF généré avec succès !');
    } catch (error) {
        console.error('Erreur lors de la génération du CV:', error);
    }
}

generateCV();