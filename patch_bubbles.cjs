const fs = require('fs');
let css = fs.readFileSync('src/profile-decor.css', 'utf8');

css = css.replace(
  '.profile-effect-bubbles { background: radial-gradient(circle at 50% 100%, rgba(0,255,255,0.2) 0%, transparent 30%); animation: pe-bubbles-rise 3s linear infinite; }',
  `.profile-effect-bubbles { 
  background-image: 
    radial-gradient(circle at 20% 100%, rgba(135,206,235,0.4) 0%, rgba(135,206,235,0.1) 10%, transparent 11%),
    radial-gradient(circle at 80% 110%, rgba(135,206,235,0.3) 0%, rgba(135,206,235,0.1) 15%, transparent 16%),
    radial-gradient(circle at 40% 90%, rgba(135,206,235,0.5) 0%, rgba(135,206,235,0.15) 5%, transparent 6%),
    radial-gradient(circle at 60% 120%, rgba(135,206,235,0.2) 0%, rgba(135,206,235,0.1) 20%, transparent 21%),
    radial-gradient(circle at 10% 80%, rgba(135,206,235,0.6) 0%, rgba(135,206,235,0.1) 8%, transparent 9%);
  background-size: 100% 200%;
  animation: pe-bubbles-rise 8s linear infinite; 
}`
);

fs.writeFileSync('src/profile-decor.css', css);
