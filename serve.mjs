import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('./dist/', import.meta.url);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};

http.createServer(async (request,response)=>{
  try {
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const relative=normalize(pathname==='/'?'index.html':pathname.replace(/^\/+/,''));
    if(relative.startsWith('..')) throw new Error('invalid path');
    const file=join(root.pathname,relative);
    const body=await readFile(file);
    response.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});
    response.end(body);
  } catch {
    response.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
