const { MeiliSearch } = require("meilisearch");

const client = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
    apiKey: process.env.MEILI_ADMIN_KEY,
});

module.exports = client;
