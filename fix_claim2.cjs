const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/ClaimDetail.tsx', 'utf8');

// I need to undo what I just did.
code = code.replace(/<Portal>/g, '');
code = code.replace(/<\/Portal>\s*\n\s*\)\}/, ')}');
code = code.replace(/import \{ Portal \} from '\.\.\/\.\.\/components\/shared\/Portal';\n/g, '');

const originalCode = code;

// Now do it carefully
if (!code.includes('import { Portal }')) {
    code = code.replace(
        "import { useState } from 'react';",
        "import { useState } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
    );
}

const target = '{/* Receipt Preview Modal */}\n      {activeReceipt && (';
const repl = '{/* Receipt Preview Modal */}\n      {activeReceipt && (\n        <Portal>';
code = code.replace(target, repl);

// Let's replace the last </div>)}
// Receipt Preview Modal is at the end of the file.
// We can just replace the last ")}    </div>  );}" with "</Portal>\n      )}\n    </div>\n  );\n}"
// or find exactly where it ends.

// Looking at ClaimDetail.tsx:
code = code.replace(
    "        </div>\n      )}\n    </div>\n  );\n}",
    "        </div>\n        </Portal>\n      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/shared/ClaimDetail.tsx', code);
