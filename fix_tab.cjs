const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

// I replaced from 2063 to 2199.
// originally 2200 was `          )}` (end of `isOwnProfile ? ( ... ) : ( ... )` maybe?)
