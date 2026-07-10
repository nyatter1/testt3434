const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

const oldBubbles = `  background-image: 
    radial-gradient(circle at 20% 100%, rgba(135,206,235,0.4) 0%, rgba(135,206,235,0.1) 10%, transparent 11%),
    radial-gradient(circle at 80% 110%, rgba(135,206,235,0.3) 0%, rgba(135,206,235,0.1) 15%, transparent 16%),
    radial-gradient(circle at 40% 90%, rgba(135,206,235,0.5) 0%, rgba(135,206,235,0.15) 5%, transparent 6%),
    radial-gradient(circle at 60% 120%, rgba(135,206,235,0.2) 0%, rgba(135,206,235,0.1) 20%, transparent 21%),
    radial-gradient(circle at 10% 80%, rgba(135,206,235,0.6) 0%, rgba(135,206,235,0.1) 8%, transparent 9%);`;

const newBubbles = `  background-image: 
    radial-gradient(circle, transparent 30%, rgba(255,255,255,0.6) 35%, rgba(135,206,235,0.2) 40%, transparent 45%),
    radial-gradient(circle, transparent 20%, rgba(255,255,255,0.4) 25%, rgba(135,206,235,0.1) 30%, transparent 35%),
    radial-gradient(circle, transparent 40%, rgba(255,255,255,0.8) 45%, rgba(135,206,235,0.3) 50%, transparent 55%),
    radial-gradient(circle, transparent 15%, rgba(255,255,255,0.5) 20%, rgba(135,206,235,0.2) 25%, transparent 30%),
    radial-gradient(circle, transparent 35%, rgba(255,255,255,0.7) 40%, rgba(135,206,235,0.25) 45%, transparent 50%);
  background-position: 20% 100%, 80% 110%, 40% 90%, 60% 120%, 10% 80%;
  background-size: 50px 50px, 80px 80px, 30px 30px, 100px 100px, 60px 60px;
  background-repeat: no-repeat;`;

css = css.replace(oldBubbles, newBubbles);

fs.writeFileSync('src/profile-decor.css', css);
