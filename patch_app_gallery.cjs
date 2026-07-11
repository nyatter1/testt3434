const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /profile_lock_count: data.profile_lock_count/,
  'profile_lock_count: data.profile_lock_count,\n        gallery: data.gallery || []'
);

code = code.replace(
  /if \('profile_lock_count' in updatedUser\) dbUpdate\.profile_lock_count = updatedUser\.profile_lock_count;/,
  'if (\'profile_lock_count\' in updatedUser) dbUpdate.profile_lock_count = updatedUser.profile_lock_count;\n    if (\'gallery\' in updatedUser) dbUpdate.gallery = updatedUser.gallery;'
);

fs.writeFileSync('src/App.tsx', code);
