const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(
  /<div>\s*<p className="text-\[9px\] uppercase font-bold text-purple-400 tracking-wider">Ruby<\/p>\s*<div className="flex items-center gap-1\.5 mt-0\.5">\s*<span className="text-base">💎<\/span>\s*<span className="text-xs font-black text-white">\{user\.rubies \?\? 10\}<\/span>\s*<\/div>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
