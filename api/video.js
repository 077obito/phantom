const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  try {
    let currentUrl = url;
    const visited = new Set();

    for (let step = 0; step
