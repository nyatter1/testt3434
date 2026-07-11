const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

// 1. Add state for gallery
code = code.replace(
  /const \[isShowingRatings, setIsShowingRatings\] = useState\(false\);/,
  'const [isShowingRatings, setIsShowingRatings] = useState(false);\n  const [isShowingGallery, setIsShowingGallery] = useState(false);'
);

// 2. Add import for GalleryViewModal
code = code.replace(
  /import \{ UserProfile, Rating, UserRank, RANKS_INFO, getLevelFromXp, ProfileLayout, ElementLayout \} from "\.\.\/types";/,
  'import { UserProfile, Rating, UserRank, RANKS_INFO, getLevelFromXp, ProfileLayout, ElementLayout } from "../types";\nimport GalleryViewModal from "./GalleryViewModal";\nimport { Image as ImageIcon } from "lucide-react";'
);

// 3. Add gallery button above mode === "view"
const galleryButton = `
          <div className="mb-6">
            <button
               onClick={() => setIsShowingGallery(true)}
               className="w-full py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.15)]"
            >
              <ImageIcon className="w-5 h-5" /> View Gallery ({targetUser.gallery?.length || 0} Photos)
            </button>
          </div>
          {mode === "view" ? (`;

code = code.replace(
  /\{\/\* Profile Content \*\/\}\s*<div\s*className=\{\`pt-14 p-8 overflow-y-auto custom-scrollbar flex-1 \$\{targetUser\.email === 'dev@gmail\.com' && mode === 'view' && \(\!targetUser\.profile_effect \|\| targetUser\.profile_effect === 'none'\) \? 'bg-blueprint-pattern' : currentEffectClass\}\`\}\s*>\s*\{mode === "view" \? \(/,
  `{/* Profile Content */}\n        <div \n          className={\`pt-14 p-8 overflow-y-auto custom-scrollbar flex-1 \${targetUser.email === 'dev@gmail.com' && mode === 'view' && (!targetUser.profile_effect || targetUser.profile_effect === 'none') ? 'bg-blueprint-pattern' : currentEffectClass}\`}\n        >\n` + galleryButton
);

// 4. Render GalleryViewModal at the bottom
const galleryViewModal = `
      {isShowingGallery && (
        <GalleryViewModal
          user={targetUser}
          onClose={() => setIsShowingGallery(false)}
        />
      )}
`;

code = code.replace(
  /\{isShowingRatings && \(/,
  galleryViewModal + '\n      {isShowingRatings && ('
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
