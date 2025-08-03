// scripts/copy-test-tool.js
// Copies test-database.html to the dist folder after every build so Netlify will deploy it
import { cpSync, existsSync } from 'fs';
import { join } from 'path';

const SRC = join(process.cwd(), 'test-database.html');
const DEST = join(process.cwd(), 'dist', 'test-database.html');

try {
  if (!existsSync(SRC)) {
    console.warn('⚠️  test-database.html not found, skipping copy');
    process.exit(0);
  }
  cpSync(SRC, DEST, { force: true });
  console.log('✓ test-database.html copied to dist');
} catch (err) {
  console.error('❌ Failed to copy test-database.html:', err);
  process.exit(1);
}
