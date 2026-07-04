const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const episodios = [];
    $('div.se-c').each((i, bloco) => {
      const temporada = $(bloco).find('span.title').text().trim() || 'Temporada';
      $(bloco).find('ul.episodios li').each((j, ep) => {
        const link = $(ep).find('div.episodiotitle a');
        episodios.push({
          temporada,
          titulo: link.text().trim() || 'Sem título',
          link: link.attr('href') || ''
        });
      });
    });

    res.json({ episodios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
