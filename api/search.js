// ============================================================
//  anime_downloader.py - Versão Node.js (100% igual ao Python)
// ============================================================

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ 
      error: 'Parâmetro "q" é obrigatório',
      animes: []
    });
  }

  try {
    console.log(`\x1b[96m🔍 Pesquisando: ${q}\x1b[0m`);
    
    // === IGUAL AO PYTHON ===
    const base_url = "https://animesonlinecc.to";
    const url = `${base_url}/search/${encodeURIComponent(q.trim())}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const animes = [];

    // === SELETOR IGUAL AO PYTHON ===
    $('article.item').each((i, element) => {
      const linkElem = $(element).find('div.data h3 a');
      const titulo = linkElem.text().trim() || "Sem título";
      const link = linkElem.attr('href') || '';
      
      if (titulo && link) {
        animes.push({
          id: i + 1,
          titulo: titulo,
          link: link.startsWith('http') ? link : `${base_url}${link}`
        });
        console.log(`\x1b[92m[${i+1}] ${titulo}\x1b[0m`);
      }
    });

    console.log(`\x1b[92m✅ Encontrados ${animes.length} animes\x1b[0m`);

    if (animes.length === 0) {
      // Fallback com dados mock (igual ao Python)
      return res.json({
        animes: getMockAnimes(q),
        total: 3,
        mock: true,
        message: 'Nenhum resultado encontrado - Mostrando exemplos'
      });
    }

    res.json({ 
      animes,
      total: animes.length,
      query: q,
      mock: false
    });

  } catch (error) {
    console.error('\x1b[91m❌ Erro na busca:\x1b[0m', error.message);
    
    // Fallback com dados mock (igual ao Python)
    res.json({
      animes: getMockAnimes(q),
      total: 3,
      mock: true,
      message: 'Erro ao buscar - Mostrando resultados de exemplo'
    });
  }
};

// ============================================================
//  DADOS MOCK (igual ao Python)
// ============================================================
function getMockAnimes(query) {
  const lowerQuery = query.toLowerCase();
  
  const mockData = {
    'naruto': [
      { id: 1, titulo: 'Naruto Clássico', link: 'https://animesonlinecc.to/anime/naruto' },
      { id: 2, titulo: 'Naruto Shippuden', link: 'https://animesonlinecc.to/anime/naruto-shippuden' },
      { id: 3, titulo: 'Boruto: Naruto Next Generations', link: 'https://animesonlinecc.to/anime/boruto' }
    ],
    'one piece': [
      { id: 1, titulo: 'One Piece', link: 'https://animesonlinecc.to/anime/one-piece' },
      { id: 2, titulo: 'One Piece Film: Red', link: 'https://animesonlinecc.to/anime/one-piece-red' }
    ],
    'jujutsu': [
      { id: 1, titulo: 'Jujutsu Kaisen', link: 'https://animesonlinecc.to/anime/jujutsu-kaisen' },
      { id: 2, titulo: 'Jujutsu Kaisen 0', link: 'https://animesonlinecc.to/anime/jujutsu-kaisen-0' }
    ],
    'demon slayer': [
      { id: 1, titulo: 'Demon Slayer: Kimetsu no Yaiba', link: 'https://animesonlinecc.to/anime/demon-slayer' },
      { id: 2, titulo: 'Demon Slayer: Mugen Train', link: 'https://animesonlinecc.to/anime/demon-slayer-mugen-train' }
    ],
    'attack on titan': [
      { id: 1, titulo: 'Attack on Titan', link: 'https://animesonlinecc.to/anime/attack-on-titan' }
    ]
  };

  for (const [key, value] of Object.entries(mockData)) {
    if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
      return value;
    }
  }

  return [
    { id: 1, titulo: `${query} (Exemplo 1)`, link: '#' },
    { id: 2, titulo: `${query} (Exemplo 2)`, link: '#' },
    { id: 3, titulo: `${query} (Exemplo 3)`, link: '#' }
  ];
}    const animes = [];

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

    if (animes.length === 0) {
      return res.json({
        animes: getMockAnimes(q),
        total: 3,
        mock: true,
        message: 'Nenhum resultado encontrado - Mostrando exemplos'
      });
    }

    res.json({ 
      animes,
      total: animes.length,
      query: q,
      mock: false
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    res.json({
      animes: getMockAnimes(q),
      total: 3,
      mock: true,
      message: 'Erro ao buscar - Mostrando resultados de exemplo'
    });
  }
};

function getMockAnimes(query) {
  const lowerQuery = query.toLowerCase();
  
  const mockData = {
    'naruto': [
      { id: 1, titulo: 'Naruto Clássico', link: 'https://animesonlinecc.to/anime/naruto' },
      { id: 2, titulo: 'Naruto Shippuden', link: 'https://animesonlinecc.to/anime/naruto-shippuden' },
      { id: 3, titulo: 'Boruto: Naruto Next Generations', link: 'https://animesonlinecc.to/anime/boruto' }
    ],
    'one piece': [
      { id: 1, titulo: 'One Piece', link: 'https://animesonlinecc.to/anime/one-piece' },
      { id: 2, titulo: 'One Piece Film: Red', link: 'https://animesonlinecc.to/anime/one-piece-red' }
    ],
    'jujutsu': [
      { id: 1, titulo: 'Jujutsu Kaisen', link: 'https://animesonlinecc.to/anime/jujutsu-kaisen' },
      { id: 2, titulo: 'Jujutsu Kaisen 0', link: 'https://animesonlinecc.to/anime/jujutsu-kaisen-0' }
    ],
    'demon slayer': [
      { id: 1, titulo: 'Demon Slayer: Kimetsu no Yaiba', link: 'https://animesonlinecc.to/anime/demon-slayer' },
      { id: 2, titulo: 'Demon Slayer: Mugen Train', link: 'https://animesonlinecc.to/anime/demon-slayer-mugen-train' }
    ],
    'attack on titan': [
      { id: 1, titulo: 'Attack on Titan', link: 'https://animesonlinecc.to/anime/attack-on-titan' }
    ]
  };

  for (const [key, value] of Object.entries(mockData)) {
    if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
      return value;
    }
  }

  return [
    { id: 1, titulo: `${query} (Exemplo 1)`, link: '#' },
    { id: 2, titulo: `${query} (Exemplo 2)`, link: '#' },
    { id: 3, titulo: `${query} (Exemplo 3)`, link: '#' }
  ];
}
