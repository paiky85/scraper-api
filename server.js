import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import unirest from 'unirest';
import path from 'path';

const app = express();
const port = 5500;

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const keyword = req.body.keyword.split(' ').join('+');
  const url = `https://www.google.com/search?hl=en&q=${keyword}`;
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.3; Win64; x64)   AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 Viewer/96.9.4688.89',
  };

  unirest
    .get(url)
    .headers(headers)
    .then(({ body }) => {
      const $ = cheerio.load(body);

      const results = $('.g ')
        .map((_, result) => {
          const $result = $(result);
          const title = $result.find('.yuRUbf').find('h3').text();
          const link = $result.find('.yuRUbf').find('a').attr('href');
          const snippet = $result.find('.VwiC3b').text();
          const displayedLink = $result.find('.yuRUbf .NJjxre .tjvcx').text();
          if (link !== undefined) {
            return {
              title: title,
              link: link,
              snippet: snippet,
              displayedLink: displayedLink,
            };
          }
        })
        .toArray();
      // console.log(results);
      res.json(results);
    });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
