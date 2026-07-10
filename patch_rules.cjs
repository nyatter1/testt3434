const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const oldRules = '<div className="space-y-1 pt-3 border-t border-purple-950/50"><h3 className="text-sm font-bold text-purple-300">3. Underage Safety Policy</h3><p className="text-xs text-purple-400 leading-relaxed">Users of all permitted ages are present here. Ensure all conversation remains strictly appropriate, polite, and safe for minor members of our platform.</p></div>';

const newRules = oldRules + '\n                <div className="space-y-1 pt-3 border-t border-purple-950/50"><h3 className="text-sm font-bold text-purple-300">4. Free Customization Update</h3><p className="text-xs text-purple-400 leading-relaxed">All profile borders and visual effects have been made completely free for all users! Enjoy designing your unique profile without currency limits.</p></div>';

code = code.replace(oldRules, newRules);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
