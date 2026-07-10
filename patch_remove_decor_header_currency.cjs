const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileDecorModal.tsx', 'utf8');

code = code.replace(
  /<div className="flex gap-2 text-xs font-bold">\s*<span className="flex items-center gap-1 text-yellow-400"><Star className="w-3\.5 h-3\.5 fill-yellow-400"\/> \{user\.coins \|\| 0\}<\/span>\s*<span className="flex items-center gap-1 text-red-400"><Sparkles className="w-3\.5 h-3\.5 fill-red-400"\/> \{user\.rubies \|\| 0\}<\/span>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/components/ProfileDecorModal.tsx', code);
