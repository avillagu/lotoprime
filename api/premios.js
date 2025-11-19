const axios = require('axios');
const cheerio = require('cheerio');

// Usamos module.exports en lugar de export default para evitar errores de compatibilidad
module.exports = async (req, res) => {
    try {
        // Intentamos conectar con Baloto
        const { data } = await axios.get('https://www.baloto.com', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
            },
            timeout: 5000 // 5 segundos máximo de espera
        });
        
        const $ = cheerio.load(data);
        const bodyText = $('body').text();
        
        // Buscamos patrones de dinero: $xx.xxx o $xxx
        // Mejoramos la búsqueda para evitar falsos positivos
        const moneyRegex = /\$([0-9]{1,3}[.,])+[0-9]{3}/g;
        const found = bodyText.match(moneyRegex) || [];

        // Si encontramos números, asumimos el orden visual de la web
        // Si NO encontramos (porque Baloto nos bloquea), enviamos un mensaje amigable
        let pBaloto = found.length > 0 ? found[0] + " Millones" : "Consultar Web";
        let pMiloto = found.length > 2 ? found[2] + " Millones" : "Consultar Web";

        res.status(200).json({
            baloto: pBaloto,
            miloto: pMiloto
        });

    } catch (error) {
        console.error("Error en scraping:", error.message);
        // Si falla la conexión, respondemos con JSON (no error 500) para que la App no se rompa
        res.status(200).json({ 
            baloto: "Ver Web Oficial", 
            miloto: "Ver Web Oficial" 
        });
    }
};
