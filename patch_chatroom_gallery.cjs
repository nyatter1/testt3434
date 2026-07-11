const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

// 1. Add state for showGallerySettingsModal
code = code.replace(
  /const \[showSecretMessageModal, setShowSecretMessageModal\] = useState\(false\);/,
  'const [showSecretMessageModal, setShowSecretMessageModal] = useState(false);\n  const [showGallerySettingsModal, setShowGallerySettingsModal] = useState(false);'
);

// 2. Add import
code = code.replace(
  /import SecretMessageModal from "\.\/SecretMessageModal";/,
  'import SecretMessageModal from "./SecretMessageModal";\nimport GallerySettingsModal from "./GallerySettingsModal";\nimport { Image as ImageIcon } from "lucide-react";'
);

// 3. Add option button
const galleryOption = `
                    {/* Gallery option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowGallerySettingsModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Gallery</span>
                        <span className="text-[9px] text-purple-500">Manage your profile photos</span>
                      </div>
                    </button>
`;
code = code.replace(
  /\{\/\* Secret Message option \*\/\}/,
  galleryOption + '\n                    {/* Secret Message option */}'
);

// 4. Render modal at the bottom
const galleryModal = `
      {/* Dynamic Gallery Settings Modal */}
      {showGallerySettingsModal && (
        <GallerySettingsModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowGallerySettingsModal(false)}
        />
      )}
`;
code = code.replace(
  /\{\/\* Dynamic Secret Message Composer Modal \*\/\}/,
  galleryModal + '\n      {/* Dynamic Secret Message Composer Modal */}'
);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
