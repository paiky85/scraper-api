import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import unirest from 'unirest';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const keyword = req.body.keyword.split(' ').join('+'); // Convert user input to search keyword
  const url = `https://www.google.com/search?hl=en&q=${keyword}`;
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.3; Win64; x64)   AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 Viewer/96.9.4688.89',
  };

  unirest
    .get(url)
    .headers(headers) //response.body
    .then(({ body }) => {
      const $ = cheerio.load(body); // load method to parse an HTML ==> return Cheerio object

      const results = $('.g ')
        .map((_, result) => {
          const $result = $(result);
          const title = $result.find('.yuRUbf').find('h3').text(); // find specific element
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

      res.json(results);
    });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
