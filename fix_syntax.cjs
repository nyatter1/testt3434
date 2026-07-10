const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');
code = code.replace(/              <\/div>\n            <\/div>\n        <\/div>/g, '              </div>\n            </div>\n          )}\n        </div>');
fs.writeFileSync('src/components/ProfileModal.tsx', code);
