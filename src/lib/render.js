import vfs from 'vinyl-fs';
import through from 'through2';
import Promise from 'bluebird';
import { minify } from 'html-minifier';
import nunjucks from 'nunjucks';

export default function render(patterns, dest, ctx, config = {}) {

  const env = nunjucks.configure(config.base, {
    watch: false
  });

  env.addFilter('nl2br', str =>
    str.replace(/(?:\r\n|\r|\n)/g, '<br>')
  );

  const renderStr = Promise.promisify(env.renderString, env);

  const transform = (file, enc, cb) => {
    if (!file.isBuffer()) {
      return cb();
    }

    renderStr(file.contents.toString(enc), ctx)
      .then(html => minify(html, { collapseWhitespace: true }))
      .then(html => {
        file.contents = new Buffer(html);
        cb(null, file);
      })
      .catch(err => {
        stream.emit('error', err);
        cb(err);
      });
  };

  const stream = through.obj(transform);

  return new Promise((resolve, reject) => {
    vfs.src(patterns)
      .pipe(stream)
      .on('error', reject)
      .pipe(vfs.dest(dest))
      .on('end', resolve);
  });
}
