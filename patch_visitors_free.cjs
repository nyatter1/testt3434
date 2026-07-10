const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileVisitorsModal.tsx', 'utf8');

code = code.replace(
  /const goldPrice = 500;\n\s*const rubiesPrice = 10;/,
  'const goldPrice = 0;\n    const rubiesPrice = 0;'
);

code = code.replace(
  /if \(updatedCoins < goldPrice\) \{[\s\S]*?return;\n\s*\}/,
  ''
);

code = code.replace(
  /if \(updatedRubies < rubiesPrice\) \{[\s\S]*?return;\n\s*\}/,
  ''
);

code = code.replace(
  /const hasAccess = user\.profile_visits_expires_at && new Date\(user\.profile_visits_expires_at\) > new Date\(\);/g,
  'const hasAccess = true;'
);

fs.writeFileSync('src/components/ProfileVisitorsModal.tsx', code);
