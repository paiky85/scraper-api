import express, { response } from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import unirest from 'unirest';
import { selectRandomUserAgent } from './userAgent.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
  const keyword = req.body.keyword.trim().split(' ').join('+'); // Convert user input to search keyword
  const encodedKeyword = encodeURIComponent(keyword); // encode to utf-8
  const lang = req.body.lang; // language search
  const url = `https://www.google.com/search?q=${encodedKeyword}&gl=cz&hl=${lang}`;

  let userAgent = selectRandomUserAgent(); // import from userAgent.js for selecting random user-agent
  let headers = {
    'User-Agent': userAgent,
  };

  unirest
    .get(url)
    .headers(headers) //response.body
    .then(({ body }) => {
      if (body === undefined) {
        const error = new Error('Problem with connection! Try it later.');
        error.code = '503';
        throw error;
      }
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
              link: decodeURIComponent(link),
              snippet: snippet,
              displayedLink: displayedLink.split(' ')[0],
            };
          }
        })
        .toArray();

      res.json(results); // response to client
    })
    .catch(error => {
      res.json({ code: error.code, message: error.message });
      console.log(error.message);
    });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
