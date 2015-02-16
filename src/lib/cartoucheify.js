import AsciiTable from 'ascii-table';

export default function cartoucheify(ctx, pkg) {
  let table = new AsciiTable();
  pkg ||= ctx.package;

  table
    .setBorder('|', '-', '+', '+')
    .setTitle('Package')
    .setTitleAlignLeft()
    .addRow('Name', pkg.name)
    .addRow('Version', pkg.version);

  if (pkg.author) {
    table.addRow('Author', typeof pkg.author === 'object' ? pkg.author.name : pkg.author);
  }
  
  if (pkg.license) {
    table.addRow('Licence', typeof pkg.license === 'object' ? pkg.license.type : pkg.license);
  }

  if (pkg.homepage) {
    table.addRow('Homepage', display(pkg.homepage));
  }

  ctx.cartouche = table.toString();
}

const homepage = url =>
  `<a href="${url}">${display(url)}</a>`;

const display = url =>
  url.replace(/^(http(s)?:\/\/)?(www.)?github.com\//, '');
