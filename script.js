const fs = require('fs');
let content = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

// Replace mapping inside fetchUsers
content = content.replace(/borderThickness: p\.border_thickness \|\| "2px",/g, 'borderThickness: p.border_thickness || "2px",\n          is_muted: p.is_muted,\n          mute_expires_at: p.mute_expires_at,');

// Replace payload mapping
content = content.replace(/borderThickness: payload\.new\.border_thickness !== undefined \? payload\.new\.border_thickness : u\.borderThickness,/g, 'borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : u.borderThickness,\n                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : u.is_muted,\n                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : u.mute_expires_at,');

content = content.replace(/borderThickness: payload\.new\.border_thickness !== undefined \? payload\.new\.border_thickness : user\.borderThickness,/g, 'borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : user.borderThickness,\n              is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : user.is_muted,\n              mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : user.mute_expires_at,');

content = content.replace(/borderThickness: payload\.new\.border_thickness !== undefined \? payload\.new\.border_thickness : prev\.borderThickness,/g, 'borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : prev.borderThickness,\n                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : prev.is_muted,\n                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : prev.mute_expires_at,');

fs.writeFileSync('src/components/ChatRoom.tsx', content);
