const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileDecorModal.tsx', 'utf8');

code = code.replace(
  'export default function ProfileDecorModal({ user, onClose, onUserUpdate }: { user: UserProfile, onClose: () => void, onUserUpdate: (u: Partial<UserProfile>) => void }) {',
  'export default function ProfileDecorModal({ user, onClose, onUserUpdate, onPurchase }: { user: UserProfile, onClose: () => void, onUserUpdate: (u: Partial<UserProfile>) => void, onPurchase?: () => void }) {'
);

code = code.replace(
  'await supabase.from("profiles").update(updates).eq("id", user.id);\n    onUserUpdate(updates);\n    onClose();',
  'await supabase.from("profiles").update(updates).eq("id", user.id);\n    onUserUpdate(updates);\n    if (onPurchase) onPurchase();\n    else onClose();'
);

fs.writeFileSync('src/components/ProfileDecorModal.tsx', code);
