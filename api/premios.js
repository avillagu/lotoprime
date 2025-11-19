const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
    try {
        // Hacemos pasar al robot como un navegador real (User-Agent)
        const { data } = await axios.get('https://www.baloto.com', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(data);
        
        // Buscamos textos que tengan formato de dinero ($xx.xxx)
        // Esta expresión regular busca el signo pesos seguido de números y puntos
        const bodyText = $('body').text();
        const moneyRegex = /\$([0-9]{1,3}\.)+[0-9]{3}/g;
        const found = bodyText.match(moneyRegex) || [];

        // Lógica simple: Baloto suele ser el primer monto grande, Miloto el segundo o tercero
        let premioBaloto = found.length > 0 ? found[0] + " Millones" : "Consultar Web";
        let premioMiloto = found.length > 2 ? found[2] + " Millones" : "Consultar Web";

        res.status(200).json({
            baloto: premioBaloto,
            miloto: premioMiloto
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error conectando con Baloto' });
    }
}
