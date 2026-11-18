// Rebuilds the single-file deliverable: node build.js  ->  black-buck.html
// Inlines src/style.css, src/coast.json (Natural Earth, clipped+simplified), src/engine.js (mission compiler) and src/app.js + src/app2.js (UI).
const fs = require('fs'), path = require('path'), src = path.join(__dirname, 'src');
const rd = f => fs.readFileSync(path.join(src, f), 'utf8');
const engine = rd('engine.js'), app = rd('app.js') + rd('app2.js');
for (const [n, c] of [['engine', engine], ['app', app]]) { try { new Function(c); } catch (e) { console.error('Syntax error in', n, e.message); process.exit(1); } }
const html = rd('index.tpl.html').replace('/*__CSS__*/', () => rd('style.css')).replace('/*__COAST__*/', () => 'const COAST=' + rd('coast.json').trim() + ';')
  .replace('/*__ENGINE__*/', () => engine).replace('/*__APP__*/', () => app);
fs.writeFileSync(path.join(__dirname, 'black-buck.html'), html);
console.log('built black-buck.html', (html.length / 1024).toFixed(0) + ' KB');
