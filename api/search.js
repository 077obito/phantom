const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param "q" é obrigatório' });

  try {
    const url = `https://animesonlinecc.to/search/${encodeURIComponent(q)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const animes = [];
    $('article.item').each((i, el) => {
      const link = $(el).find('div.data h3 a');
      animes.push({
        id: i + 1,
        titulo: link.text().trim() || 'Sem título',
        link: link.attr('href') || ''
      });
    });

    res.json({ animes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
