
export default function doccoify(ctx) {
  ctx.data.forEach(splitInner);
}

function splitInner(item) {
  if ('value' in item.context) {
    item.context.inner = detach(item.context.value);
  }
  if ('code' in item.context) {
    item.context.inner = detach(item.context.code);
  }
}

function detach(str) {
  let sections = [];
  let hasCode = '';
  let comments = '';
  let code = '';

  function save() {
    if (comments === '' && code === '') return;
    sections.push({ comments, code });
    hasCode = comments = code = '';
  }

  str.split('\n')
    .filter(notWhitespace)
    .filter(notEmpty)
    // .map(line => line.trim())
    .forEach(line => {
      if (isComment(line)) {
        if (hasCode) save();
        comments += `${rmDelimiter(line)}\n`;
      }
      else {
        hasCode = true;
        code += `${line}\n`;
      }
    });

  save();

  return sections;
}

const isComment = line => /^\s*\/\/\s*.+/.test(line);
const rmDelimiter = line => line.replace(/^\s*\/\/\s*/, '');
const notWhitespace = line => /\S+/.test(line);
const notEmpty = line => !/^\s*\(?\)?\s*$/.test(line);
