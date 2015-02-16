import assign from 'object-assign';
import def from '../defaults';

export default function applyDefaults(ctx) {
  return assign({}, def, ctx, {
    groups: assign(def.groups, ctx.groups),
    display: assign(def.display, ctx.display),
  });
}
