import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageRoot = join(root, 'packages/fastify-http-exceptions');
const publish = join(packageRoot, 'publish');
rmSync(publish, { recursive: true, force: true });
mkdirSync(publish, { recursive: true });
cpSync(join(packageRoot, 'dist'), join(publish, 'dist'), {
  recursive: true,
  filter: (source) => !/\.(test|spec)\./.test(source) && !source.endsWith('.tsbuildinfo'),
});
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
delete manifest.scripts;
delete manifest.devDependencies;
writeFileSync(join(publish, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
for (const file of ['README.md', 'LICENSE']) cpSync(join(root, file), join(publish, file));
console.log(`Prepared ${publish}; nothing has been published.`);
