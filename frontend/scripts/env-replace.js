const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); // Charge le .env

const envFile = path.join(__dirname, '../src/environments/environment.prod.ts');
let content = fs.readFileSync(envFile, 'utf8');

// Remplace les tokens dans le fichier par les vraies valeurs du .env
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  const regex = new RegExp(`%%${key}%%`, 'g');
  content = content.replace(regex, value);
});

fs.writeFileSync(envFile, content);
console.log('✅ Environnement injecté avec succès dans environment.prod.ts');
