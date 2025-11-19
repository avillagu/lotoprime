const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const { data } = await axios.get('https://www.baloto.com', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000
        });
        
        const $ = cheerio.load(data);
        const bodyText = $('body').text(); // Todo el texto de la web mezclado
        
        // ---------------------------------------------------------
        // 1. NUEVA FÓRMULA (REGEX)
        // Antes fallaba con $400 porque exigía punto. Ahora acepta:
        // $400 (sin punto) y $5.900 (con punto)
        // ---------------------------------------------------------
        const moneyRegex = /\$\s*([0-9]{1,3}(?:[.,][0-9]{3})*)/;

        // ---------------------------------------------------------
        // 2. BUSCAR BALOTO
        // Buscamos la frase exacta y cortamos el texto que le sigue
        // ---------------------------------------------------------
        let pBaloto = "Consultar Web";
        // Buscamos la posición donde dice "ACUMULADO BALOTO"
        // (Usamos indexOf para ser precisos, ignoramos mayúsculas/minúsculas)
        const indexBaloto = bodyText.toUpperCase().indexOf("ACUMULADO BALOTO");
        
        if (indexBaloto !== -1) {
            // Tomamos los siguientes 100 caracteres después del título
            const snippet = bodyText.substring(indexBaloto, indexBaloto + 100);
            const match = snippet.match(moneyRegex);
            if (match) pBaloto = match[0] + " Millones";
        }

        // ---------------------------------------------------------
        // 3. BUSCAR MILOTO (CORREGIDO)
        // ---------------------------------------------------------
        let pMiloto = "Consultar Web";
        // Buscamos la posición exacta de "ACUMULADO MILOTO"
        const indexMiloto = bodyText.toUpperCase().indexOf("ACUMULADO MILOTO");

        if (indexMiloto !== -1) {
            // Tomamos los siguientes 100 caracteres después del título
            const snippet = bodyText.substring(indexMiloto, indexMiloto + 100);
            const match = snippet.match(moneyRegex);
            
            // Si encontramos un precio (ej: $400), lo guardamos
            if (match) pMiloto = match[0] + " Millones";
        }

        // Si por alguna razón falló la búsqueda exacta, usamos valores de respaldo seguros
        if (pBaloto === "Consultar Web") pBaloto = "Ver Web";
        if (pMiloto === "Consultar Web") pMiloto = "Ver Web";

        res.status(200).json({
            baloto: pBaloto,
            miloto: pMiloto
        });

    } catch (error) {
        console.error("Error scraping:", error.message);
        res.status(200).json({ baloto: "...", miloto: "..." });
    }
};
