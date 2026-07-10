const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileDecorModal.tsx', 'utf8');

// Remove the cost displays on borders
code = code.replace(
  /\{b\.id !== "none" && !isOwned && \([\s\S]*?\{isPremium \? <><Sparkles className="w-2 h-2 text-red-400"\/> 10<\/> : <><Star className="w-2 h-2 text-yellow-400"\/> 100<\/>\}[\s\S]*?<\/div>\n\s*\)\}/,
  ''
);
// Also remove costCoins and costRubies from borders list
code = code.replace(
  /const isPremium = i > 4;\n\s*const costCoins = isPremium \? 0 : 0;\n\s*const costRubies = isPremium \? 10 : 0;/,
  ''
);

fs.writeFileSync('src/components/ProfileDecorModal.tsx', code);
