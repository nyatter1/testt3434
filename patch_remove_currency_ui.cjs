const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

// The block that displays the gold balance:
// <div className="border-t border-purple-950/40 pt-2">
//   <p className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">Gold</p>
//   <div className="flex items-center gap-1.5 mt-0.5">
//     <span className="text-base">🪙</span>
//     <span className="text-xs font-black text-white">{user.coins ?? 1000}</span>
//   </div>
// </div>

code = code.replace(
  /<div className="border-t border-purple-950\/40 pt-2">[\s\S]*?<p className="text-\[9px\] uppercase font-bold text-purple-400 tracking-wider">Gold<\/p>[\s\S]*?<div className="flex items-center gap-1\.5 mt-0\.5">[\s\S]*?<span className="text-base">🪙<\/span>[\s\S]*?<span className="text-xs font-black text-white">\{user\.coins \?\? 1000\}<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>/g,
  ''
);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
