import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const files=['src/main.js','src/scene.js','src/teachings.js','server.mjs','vite.config.js','public/sw.js'];
for(const file of files){execFileSync('node',['--check',file],{stdio:'inherit'});}
const {teachings,teachingById,offlineGuidance}=await import('../src/teachings.js');
assert.equal(teachings.length,4);assert.ok(teachings.every(t=>t.id&&t.url.startsWith('https://suttacentral.net/')&&!t.summary.includes('YLV')));
assert.ok(offlineGuidance('hơi thở tự nhiên').sources.includes('MN118'));
assert.deepEqual(offlineGuidance('đề tài chưa có trong kinh tạng abcxyz').sources,[]);
assert.ok(teachings.every(t=>teachingById[t.id]));
const html=fs.readFileSync('index.html','utf8');assert.ok(html.includes('data-view="teacher"'));
const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');assert.ok(workflow.includes('npm test'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));assert.equal(pkg.version,'1.4.0');
console.log('PASS: JS syntax, verified reference lookup, source URLs, app layout, workflow');
