import http from 'node:http'; import fs from 'node:fs';
const SP='/tmp/claude-0/-home-user-claude/81ba19d9-4465-5a73-93ba-4567dbbb8a40/scratchpad';
http.createServer((_q,res)=>{const b=fs.readFileSync(SP+'/preview.html');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':b.length});res.end(b);}).listen(4000);
