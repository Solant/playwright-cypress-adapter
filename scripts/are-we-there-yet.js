import fs from 'node:fs/promises';

const contents = await fs.readFile('COMPATIBILITY.md', { encoding: 'utf-8' });

const supported = contents.match(/✅/g).length - 1;
const partial = contents.match(/⚠️/g).length - 1;
const wip = contents.match(/🕓/g).length - 1;
const nope = contents.match(/⭕/g).length - 1;

const all = supported + partial + wip + nope;

// eslint-disable-next-line no-undef, no-console
console.log(`${Math.floor(((supported + partial) / all) * 100)}% (${supported + partial}/${all})`);
