const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

css = css.replace(
  '@keyframes pe-bubbles-rise { 0% { background-position: 0 100px; } 100% { background-position: 0 0; } }',
  '@keyframes pe-bubbles-rise { 0% { background-position: 0 100%, 0 120%, 0 80%, 0 150%, 0 90%; } 100% { background-position: 0 -100%, 0 -80%, 0 -120%, 0 -50%, 0 -110%; } }'
);

fs.writeFileSync('src/profile-decor.css', css);
