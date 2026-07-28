const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');

if (!code.includes('createPortal')) {
    code = code.replace(
        "import { useState, useRef } from 'react';",
        "import { useState, useRef } from 'react';\nimport { createPortal } from 'react-dom';"
    );
}

// Wrap Preview Modal
code = code.replace(
    "{/* Preview Modal */}\n      {selectedReceipt && (",
    "{/* Preview Modal */}\n      {selectedReceipt && createPortal("
);
code = code.replace(
    "        </div>\n      )}",
    "        </div>,\n        document.body\n      )}"
);

// Wrap Upload Modal
code = code.replace(
    "{/* Upload Modal */}\n      {showUploadModal && (",
    "{/* Upload Modal */}\n      {showUploadModal && createPortal("
);
code = code.replace(
    "        </div>\n      )}\n    </div>\n  );\n}",
    "        </div>,\n        document.body\n      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/shared/Receipts.tsx', code);
