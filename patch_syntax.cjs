const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

css = css.replace(/\}\`;/g, '}');

fs.writeFileSync('src/profile-decor.css', css);
