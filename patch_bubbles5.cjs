const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

css = css.replace(
  'background-repeat: repeat;\n  background-size: 100% 200%;',
  'background-repeat: repeat;'
);

fs.writeFileSync('src/profile-decor.css', css);
