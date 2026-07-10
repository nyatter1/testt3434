const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileDecorModal.tsx', 'utf8');

// Remove cost calculations
code = code.replace(
  /const calculateCost = \(\) => \{[\s\S]*?return \{ coins, rubies \};\n  \};/,
  'const calculateCost = () => { return { coins: 0, rubies: 0 }; };'
);

// Remove the cost displays on borders
code = code.replace(
  /\{b\.id !== "none" && !isOwned && \([\s\S]*?\{isPremium \? <><Sparkles className="w-2 h-2 text-red-400"\/> 10\/> : <><Star className="w-2 h-2 text-yellow-400"\/> 100\/>\}[\s\S]*?<\/div>\n\s*\)\}/,
  ''
);

// Remove the cost displays on effects
code = code.replace(
  /\{e\.id !== "none" && !isOwned && \([\s\S]*?\{e\.type === 'rubies' \? \([\s\S]*?<><Sparkles className="w-3 h-3 text-red-400"\/> \{e\.cost\}<\/>[\s\S]*?\) : \([\s\S]*?<><Star className="w-3 h-3 text-yellow-400"\/> \{e\.cost\}<\/>[\s\S]*?\)\]?[\s\S]*?<\/div>\n\s*\)\}/,
  ''
);

// Simplify the "Total Cost" and "Purchase Action" sections at the bottom
code = code.replace(
  /<div className="flex justify-between items-center mb-3 text-sm font-bold text-white">[\s\S]*?<\/div>\n\s*<\/div>/,
  '<div className="flex justify-between items-center mb-3 text-sm font-bold text-white"><span>Price:</span><span className="text-green-400">FREE</span></div>'
);

// Simplify button logic
code = code.replace(
  /disabled=\{!canAfford \|\| isSaving\}/,
  'disabled={isSaving}'
);
code = code.replace(
  /\{isSaving \? "Saving\.\.\." : canAfford \? <><Check className="w-4 h-4" \/> Apply Changes<\/> : "Not enough currency"\}/,
  '{isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Apply Changes</>}'
);
code = code.replace(
  /canAfford \? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600\/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'/,
  "'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'"
);

// Remove canAfford computation entirely or just let it be true
code = code.replace(
  /const canAfford = user\.coins >= costCoins && user\.rubies >= costRubies;/,
  'const canAfford = true;'
);

// In handleSave, remove deducting coins and rubies
code = code.replace(
  /if \(!canAfford\) return;/g,
  ''
);

code = code.replace(
  /const updates: Partial<UserProfile> = \{[\s\S]*?\};/,
  'const updates: Partial<UserProfile> = {\n      border: selectedBorder,\n      border_thickness: selectedThickness,\n      border_style: selectedStyle,\n      profile_effect: selectedEffect\n    };'
);

fs.writeFileSync('src/components/ProfileDecorModal.tsx', code);
