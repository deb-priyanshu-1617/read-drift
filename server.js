import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;

app.use(express.static('public'));

app.get('/manga', async (req, res) => {
  const title = req.query.title;
  const response = await fetch(`https://api.mangadex.org/manga?title=${title}`);
  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
