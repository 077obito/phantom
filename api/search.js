const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ 
      error: 'Parâmetro "q" é obrigatório',
      message: 'Digite o nome de um anime'
    });
  }

  try {
    console.log(`🔍 Buscando: ${q}`);
    
    const searchUrl = `https://animesonlinecc.to/search/${encodeURIComponent(q.trim())}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const animes = [];

    // Selecionar os artigos de anime
    $('article.item').each((i, element) => {
      const titleElem = $(element).find('div.data h3 a');
      const title = titleElem.text().trim();
      const link = titleElem.attr('href');
      
      if (title && link) {
        animes.push({
          id: i + 1,
          titulo: title,
          link: link.startsWith('http') ? link : `https://animesonlinecc.to${link}`
        });
      }
    });

    // Se não encontrou com article.item, tenta outro seletor
    if (animes.length === 0) {
      $('a[href*="/anime/"]').each((i, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr('href');
        if (title && link && !animes.find(a => a.link === link)) {
          animes.push({
            id: i + 1,
            titulo: title,
            link: link.startsWith('http') ? link : `https://animesonlinecc.to${link}`
          });
        }
      });
    }

    console.log(`✅ Encontrados ${animes.length} animes`);

    if (animes.length === 0) {
      return res.status(404).json({
        animes: [],
        message: 'Nenhum anime encontrado. Tente outro termo.'
      });
    }

    res.json({ 
      animes,
      total: animes.length,
      query: q
    });

  } catch (error) {
    console.error('❌ Erro na busca:', error.message);
    
    // Se o site estiver bloqueado, retorna dados mock para teste
    if (error.code === 'ECONNABORTED' || error.response?.status === 403) {
      return res.json({
        animes: [
          { id: 1, titulo: "Naruto Shippuden (Mock)", link: "https://animesonlinecc.to/anime/naruto-shippuden" },
          { id: 2, titulo: "One Piece (Mock)", link: "https://animesonlinecc.to/anime/one-piece" },
          { id: 3, titulo: "Jujutsu Kaisen (Mock)", link: "https://animesonlinecc.to/anime/jujutsu-kaisen" }
        ],
        total: 3,
        mock: true,
        message: "Dados mockados - O site original pode estar bloqueando requisições"
      });
    }

    res.status(500).json({ 
      error: error.message,
      message: 'Erro ao buscar animes. Tente novamente.'
    });
  }
};
