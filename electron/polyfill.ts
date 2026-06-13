import { fileURLToPath } from 'url';
import * as path from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

Object.assign(globalThis, {
  __filename: _filename,
  __dirname: _dirname,
});
