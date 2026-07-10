const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /onUpdate=\{async \(updated: any\) => \{\s+const mapped: any = \{\};\s+if \(updated\.username \!\=\= undefined\) mapped\.username = updated\.username;\s+if \(updated\.age \!\=\= undefined\) mapped\.age = updated\.age;\s+if \(updated\.gender \!\=\= undefined\) mapped\.gender = updated\.gender;\s+if \(updated\.pfp \!\=\= undefined\) mapped\.pfp = updated\.pfp;\s+if \(updated\.banner \!\=\= undefined\) mapped\.banner = updated\.banner;\s+if \(updated\.aboutMe \!\=\= undefined\) \s+if \(updated\.mood \!\=\= undefined\) mapped\.mood = updated\.mood;\s+if \(updated\.language \!\=\= undefined\) mapped\.language = updated\.language;\s+if \(updated\.currentRoom \!\=\= undefined\) mapped\.current_room = updated\.currentRoom;\s+if \(updated\.border \!\=\= undefined\) mapped\.border = updated\.border;\s+if \(updated\.borderThickness \!\=\= undefined\) mapped\.border_thickness = updated\.borderThickness;\s+if \(updated\.cardBg \!\=\= undefined\) mapped\.card_bg = updated\.cardBg;\s+if \(updated\.likes \!\=\= undefined\) \s+if \(updated\.rank \!\=\= undefined\) mapped\.rank = updated\.rank;\s+if \(updated\.effect \!\=\= undefined\) mapped\.effect = updated\.effect;\s+\}\s+\}\s+const \{ error \} = await supabase/g;

const replacement = `onUpdate={async (updated: any) => {
            const mapped: any = {};
            if (updated.username !== undefined) mapped.username = updated.username;
            if (updated.age !== undefined) mapped.age = updated.age;
            if (updated.gender !== undefined) mapped.gender = updated.gender;
            if (updated.pfp !== undefined) mapped.pfp = updated.pfp;
            if (updated.banner !== undefined) mapped.banner = updated.banner;
            if (updated.aboutMe !== undefined) mapped.about_me = updated.aboutMe;
            if (updated.mood !== undefined) mapped.mood = updated.mood;
            if (updated.language !== undefined) mapped.language = updated.language;
            if (updated.currentRoom !== undefined) mapped.current_room = updated.currentRoom;
            if (updated.border !== undefined) mapped.border = updated.border;
            if (updated.borderThickness !== undefined) mapped.border_thickness = updated.borderThickness;
            if (updated.cardBg !== undefined) mapped.card_bg = updated.cardBg;
            if (updated.likes !== undefined) mapped.likes = updated.likes;
            if (updated.rank !== undefined) mapped.rank = updated.rank;
            if (updated.effect !== undefined) mapped.effect = updated.effect;

            const { error } = await supabase`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatRoom.tsx', code);
