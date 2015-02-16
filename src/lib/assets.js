import { join } from 'path';
import vfs from 'vinyl-fs';
import Promise from 'bluebird';

export default function assets(src, dest) {
  return new Promise((resolve, reject) => {
    vfs.src(join(src, '/**/*.{css,js,svg,png,eot,woff}'))
      .pipe(vfs.dest(join(dest, 'assets')))
      .on('error', reject)
      .on('end', resolve);
  });
}
