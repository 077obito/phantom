const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL do anime é obrigatória' });
  }

  try {
    console.log(`📋 Carregando episódios de: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const episodios = [];

    // Buscar por temporadas
    $('div.se-c').each((i, bloco) => {
      const temporadaElem = $(bloco).find('span.title');
      const temporada = temporadaElem.length > 0 ? temporadaElem.text().trim() : 'Temporada';
      
      $(bloco).find('ul.episodios li').each((j, ep) => {
        const linkElem = $(ep).find('div.episodiotitle a');
        const titulo = linkElem.text().trim() || `Episódio ${j + 1}`;
        const link = linkElem.attr('href');
        
        if (link) {
          episodios.push({
            temporada,
            titulo,
            link: link.startsWith('http') ? link : `https://animesonlinecc.to${link}`
          });
        }
      });
    });

    // Se não encontrou com div.se-c, tenta outro seletor
    if (episodios.length === 0) {
      $('li a[href*="/episodio/"]').each((i, element) => {
        const titulo = $(element).text().trim() || `Episódio ${i + 1}`;
        const link = $(element).attr('href');
        if (link) {
          episodios.push({
            temporada: 'Única',
            titulo,
            link: link.startsWith('http') ? link : `https://animesonlinecc.to${link}`
          });
        }
      });
    }

    console.log(`✅ Encontrados ${episodios.length} episódios`);

    if (episodios.length === 0) {
      // Dados mock para teste
      return res.json({
        episodios: [
          { temporada: "Temporada 1", titulo: "Episódio 1", link: "#" },
          { temporada: "Temporada 1", titulo: "Episódio 2", link: "#" },
          { temporada: "Temporada 1", titulo: "Episódio 3", link: "#" }
        ],
        mock: true,
        message: "Dados mockados - Site pode estar indisponível"
      });
    }

    res.json({ episodios });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Fallback com dados mock
    res.json({
      episodios: [
        { temporada: "Temporada 1", titulo: "Episódio 1 (Mock)", link: "#" },
        { temporada: "Temporada 1", titulo: "Episódio 2 (Mock)", link: "#" },
        { temporada: "Temporada 1", titulo: "Episódio 3 (Mock)", link: "#" }
      ],
      mock: true,
      message: "Dados mockados - Erro ao carregar episódios"
    });
  }
};
