const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(
  '<ProfileDecorModal\n          user={user}\n          onClose={() => setShowProfileDecorModal(false)}\n          onUserUpdate={onUpdateUser}\n        />',
  '<ProfileDecorModal\n          user={user}\n          onClose={() => setShowProfileDecorModal(false)}\n          onUserUpdate={onUpdateUser}\n          onPurchase={() => {\n            setShowProfileDecorModal(false);\n            setProfileTarget(user);\n            setProfileMode("view");\n          }}\n        />'
);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
