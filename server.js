import express, { response } from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import unirest from 'unirest';
import { selectRandom } from './userAgent.js';
import utf8 from 'utf8';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
app.post('/', async (req, res) => {
  const keyword = req.body.keyword.trim().split(' ').join('+'); // Convert user input to search keyword
  const encodedURL = encodeURIComponent(keyword);
  const url = `https://www.google.com/search?gl=cz&hl=cs&q=${encodedURL}`;

  let userAgent = selectRandom(); // import from userAgent.js for selecting random user-agent
  let headers = {
    'User-Agent': userAgent,
  };
  console.log(headers);
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
    })
    .catch(error => {
      console.log(error);
    });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));

/*
  unirest
    .get(url)
    .headers(headers) //response.body
    .then(({ body }) => {
      console.log(response.bod);
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
    })
    .catch(error => {
      console.log(error);
    });

*/
