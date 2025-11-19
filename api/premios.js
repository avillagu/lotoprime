const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const { data } = await axios.get('https://www.baloto.com', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 5000
        });
        
        const $ = cheerio.load(data);
        const bodyText = $('body').text();
        
        // Expresión regular para encontrar dinero ($xx.xxx o $xxx)
        const moneyRegex = /\$([0-9]{1,3}[.,])+[0-9]{3}/g;
        
        // 1. PARA BALOTO (Seguimos usando el primero que aparece, suele ser el Acumulado Mayor)
        const allMoneyMatches = bodyText.match(moneyRegex) || [];
        let pBaloto = allMoneyMatches.length > 0 ? allMoneyMatches[0] + " Millones" : "Consultar Web";

        // 2. PARA MILOTO (Búsqueda Inteligente por contexto)
        let pMiloto = "Consultar Web";
        
        // Buscamos dónde dice "MiLoto" (ignorando mayúsculas/minúsculas)
        const indexMiLoto = bodyText.toLowerCase().indexOf("miloto");
        
        if (indexMiLoto !== -1) {
            // Cortamos el texto justo después de donde dice "MiLoto" (miramos los siguientes 400 caracteres)
            const textAfterLabel = bodyText.substring(indexMiLoto, indexMiLoto + 400);
            // Buscamos el primer precio que aparezca en ese pedazo
            const match = textAfterLabel.match(moneyRegex);
            if (match) {
                pMiloto = match[0] + " Millones";
            }
        } 
        
        // Plan B: Si la búsqueda inteligente falla, intentamos el índice 3 
        // (El orden suele ser: Baloto[0] -> Revancha[1] -> ColorLoto[2] -> MiLoto[3])
        if (pMiloto === "Consultar Web" && allMoneyMatches.length > 3) {
             pMiloto = allMoneyMatches[3] + " Millones";
        }

        res.status(200).json({
            baloto: pBaloto,
            miloto: pMiloto
        });

    } catch (error) {
        console.error("Error scraping:", error.message);
        res.status(200).json({ 
            baloto: "Ver Web", 
            miloto: "Ver Web" 
        });
    }
};
