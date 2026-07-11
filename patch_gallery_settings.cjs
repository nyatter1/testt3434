const fs = require('fs');
let code = fs.readFileSync('src/components/GallerySettingsModal.tsx', 'utf8');

code = code.replace(
  /const MAX_WIDTH = 1200;/,
  'const MAX_WIDTH = 600;'
);
code = code.replace(
  /const MAX_HEIGHT = 1200;/,
  'const MAX_HEIGHT = 600;'
);
code = code.replace(
  /canvas\.toDataURL\('image\/jpeg', 0\.7\)/,
  'canvas.toDataURL(\'image/jpeg\', 0.5)'
);

fs.writeFileSync('src/components/GallerySettingsModal.tsx', code);
