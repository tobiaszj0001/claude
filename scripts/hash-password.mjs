#!/usr/bin/env node
// Generuje hash bcrypt hasła do zmiennej AUTH_PASSWORD_HASH.
// Użycie: node scripts/hash-password.mjs "twoje-haslo"
import bcrypt from "bcryptjs";

const pwd = process.argv[2];
if (!pwd) {
  console.error('Użycie: node scripts/hash-password.mjs "twoje-haslo"');
  process.exit(1);
}

const hash = bcrypt.hashSync(pwd, 10);

console.log("\nHash (wklej do panelu Vercel jako AUTH_PASSWORD_HASH):");
console.log(hash);
console.log("\nDo pliku .env (znaki $ muszą być poprzedzone \\, bo Next.js");
console.log("rozwija zmienne w wartościach — inaczej hash zostanie zepsuty):");
console.log(`AUTH_PASSWORD_HASH="${hash.replace(/\$/g, "\\$")}"\n`);
