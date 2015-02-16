import { resolve } from 'path';
// import extras from 'sassdoc-extras';
import Promise from 'bluebird';
import applyDefaults from './lib/defaults';
import doccoify from './lib/doccoify';
import cartoucheify from './lib/cartoucheify';
import render from './lib/render';
import copy from './lib/assets';

export default function theme(dest, ctx) {
  ctx = applyDefaults(ctx);

  doccoify(ctx);
  cartoucheify(ctx);

  let patterns = resolve(__dirname, './views/*.html');
  let base = resolve(__dirname, './views');
  let assets = resolve(__dirname, './assets');
  let dest = resolve(dest);

  return Promise.all([
    render(patterns, dest, ctx, { base }),
    copy(assets, dest)
  ]);
}
