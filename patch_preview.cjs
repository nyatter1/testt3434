const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileDecorModal.tsx', 'utf8');

// Replace the outer container to include sepia
code = code.replace(
  'selectedBorder !== "none" ? `profile-border-${selectedBorder}` : "border border-purple-900/40"',
  'selectedBorder !== "none" ? `profile-border-${selectedBorder}` : "border border-purple-900/40" } ${selectedEffect === "sepia" ? "profile-effect-sepia" : ""'
);

// Remove the absolute inset-0 z-0 div
code = code.replace(
  '<div className={`absolute inset-0 z-0 ${selectedEffect !== \'none\' ? `profile-effect-${selectedEffect}` : \'\'}`} />',
  ''
);

// Add the effect to the content container
code = code.replace(
  '<div className="px-6 pb-6 flex-1 flex flex-col items-center text-center -mt-10">',
  '<div className={`px-6 pb-6 flex-1 flex flex-col items-center text-center -mt-10 ${selectedEffect !== "none" && selectedEffect !== "sepia" ? "profile-effect-" + selectedEffect : ""}`}>'
);

fs.writeFileSync('src/components/ProfileDecorModal.tsx', code);
