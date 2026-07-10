const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

const regex = /<div>\s*\{\/\* Tab Headings \*\/\}\s*<div className="flex gap-4 mb-6 border-b border-white\/\[0\.05\] pb-3">[\s\S]*?<\/div>\s*\{\/\* Edit Options List \*\/\}\s*<div className="flex flex-col border-t border-b border-white\/\[0\.05\] divide-y divide-white\/\[0\.05\]">\s*\{editTab === "account" \? \(\s*<>\s*<button[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\) : \(\s*<div>/g;

// Instead of regex, let's use string manipulation

