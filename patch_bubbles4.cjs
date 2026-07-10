const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

const newBubbles = `  background-image: 
    radial-gradient(circle, transparent 20%, rgba(255,255,255,0.6) 25%, rgba(135,206,235,0.2) 30%, transparent 31%),
    radial-gradient(circle, transparent 15%, rgba(255,255,255,0.4) 20%, rgba(135,206,235,0.1) 25%, transparent 26%),
    radial-gradient(circle, transparent 25%, rgba(255,255,255,0.8) 30%, rgba(135,206,235,0.3) 35%, transparent 36%);
  background-size: 40px 40px, 80px 80px, 120px 120px;
  background-position: 0 0, 40px 60px, 100px 30px;
  background-repeat: repeat;`;

css = css.replace(/background-image: \n    radial-gradient\(circle, transparent 30%.*?background-repeat: no-repeat;/s, newBubbles);

fs.writeFileSync('src/profile-decor.css', css);
