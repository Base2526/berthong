// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html#authentication
const { Client } = require("@elastic/elasticsearch");
const elastic = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

export {
  elastic
};

