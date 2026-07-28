const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');

// The file currently has messy document.body placements. Let's fix it by parsing exactly.

// Replace the bad grid closing if it's there
code = code.replace(
    /<\/div>,\s*document\.body\s*}\)\s*{\/\* Preview Modal \*\//,
    "</div>\n      )}\n      {/* Preview Modal */}"
);

// Preview Modal closing
code = code.replace(
    /<\/div>\s*}\)\s*{\/\* Upload Modal \*\//,
    "</div>,\n        document.body\n      )}\n      {/* Upload Modal */}"
);

// We need to verify if the file has createPortal.
if (!code.includes('import { createPortal }')) {
    code = code.replace(
        "import { useState, useRef } from 'react';",
        "import { useState, useRef } from 'react';\nimport { createPortal } from 'react-dom';"
    );
}

fs.writeFileSync('src/pages/shared/Receipts.tsx', code);
