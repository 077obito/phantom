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
    return res.status(400).json({ error: 'URL do episódio é obrigatória' });
  }

  try {
    console.log(`🎬 Acessando episódio: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let videoUrl = null;

    // 1. Procurar em iframes
    $('iframe').each((i, iframe) => {
      const src = $(iframe).attr('src');
      if (src && src.includes('blogger.com')) {
        videoUrl = src;
        return false;
      }
    });

    // 2. Procurar padrões no HTML
    if (!videoUrl) {
      const patterns = [
        /https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi,
        /videoplayback[^"'\s]+/gi,
        /contentUrl["']\s*:\s*["']([^"']+)["']/gi,
        /videoUrl["']\s*:\s*["']([^"']+)["']/gi
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          videoUrl = match[0] || match;
          break;
        }
      }
    }

    // 3. Se achou Blogger, simula o redirect
    if (videoUrl && videoUrl.includes('blogger.com')) {
      try {
        const redirectResp = await axios.get(videoUrl, {
          maxRedirects: 0,
          validateStatus: status => status >= 200 && status < 400
        });
        
        if (redirectResp.headers.location) {
          videoUrl = redirectResp.headers.location;
        }
      } catch (e) {
        console.log('Redirect não seguiu automaticamente');
      }
    }

    // Fallback com URL mock
    if (!videoUrl || videoUrl === '#') {
      videoUrl = 'https://example.com/sample-video.mp4';
    }

    console.log(`✅ Vídeo encontrado: ${videoUrl.substring(0, 100)}...`);

    res.json({
      url: videoUrl,
      message: videoUrl.includes('example.com') ? 'URL mock - Site pode estar indisponível' : 'Sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    res.json({
      url: 'https://example.com/sample-video.mp4',
      mock: true,
      message: 'Vídeo mockado - O site pode estar bloqueando a requisição'
    });
  }
};
