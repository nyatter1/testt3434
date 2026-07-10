const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(
  /\{\/\* Convert option \*\/\}[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
