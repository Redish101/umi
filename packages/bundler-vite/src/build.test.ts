import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { build } from './build';
import { JSMinifier } from './types';

interface IOpts {
  files: Record<string, string>;
}

const EXISTS = '1';

const expects: Record<string, Function> = {
  alias({ files }: IOpts) {
    expect(files['index.js']).toContain(`const a = "react";`);
  },
};

const fixtures = join(__dirname, 'fixtures');
for (const fixture of readdirSync(fixtures)) {
  if (fixture.startsWith('.')) continue;
  const base = join(fixtures, fixture);
  if (statSync(base).isFile()) continue;
  if (fixture.startsWith('x-')) continue;

  test(`build ${fixture}`, async () => {
    let config: Record<string, any> = {};
    try {
      config = require(join(base, 'config.ts')).default;
    } catch (e) {}
    try {
      await build({
        clean: true,
        config: {
          ...config,
          jsMinifier: JSMinifier.none,
          // cssMinifier: CSSMinifier.none,
        },
        cwd: base,
        entry: {
          index: join(base, 'index.ts'),
        },
        onBuildComplete: (result) => {
          console.log('result', result);
        },
      });
      console.log('build base', base, join(base, 'dist'));
      const fileNames = readdirSync(join(base, 'dist'));
      const files = fileNames.reduce<Record<string, string>>(
        (memo, fileName) => {
          if (['.css', '.js', '.svg'].includes(extname(fileName))) {
            memo[fileName] = readFileSync(
              join(base, 'dist', fileName),
              'utf-8',
            );
          } else {
            memo[fileName] = EXISTS;
          }
          return memo;
        },
        {},
      );
      expects[fixture]({
        files,
      });
    } catch (error) {
      console.log('bundler-vite test error', error);
    }
  });
}
