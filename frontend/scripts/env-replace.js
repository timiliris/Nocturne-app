const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../src/environments/environment.prod.ts');
let content = fs.readFileSync(outputPath, 'utf8');

// Utilise process.env pour injecter les valeurs passées via Docker
const replacements = {
  API_URL: process.env.API_URL,
  MEILI_URL: process.env.MEILI_URL,
  MEILI_SEARCH_KEY: process.env.MEILI_SEARCH_KEY,
};

Object.entries(replacements).forEach(([key, value]) => {
  const regex = new RegExp(`%%${key}%%`, 'g');
  content = content.replace(regex, value || '');
});

fs.writeFileSync(outputPath, content);
console.log('✅ Environnement injecté dans environment.prod.ts');
