const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/custom_status: data\.custom_status \|\| "online"/g, 'custom_status: data.custom_status || "online",\n        is_banned: data.is_banned,\n        ban_reason: data.ban_reason,\n        is_kicked: data.is_kicked,\n        kick_reason: data.kick_reason,\n        kick_expires_at: data.kick_expires_at,\n        is_muted: data.is_muted,\n        mute_reason: data.mute_reason,\n        mute_expires_at: data.mute_expires_at');

fs.writeFileSync('src/App.tsx', content);
