const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/ClaimDetail.tsx', 'utf8');

if (!code.includes('import { Portal }')) {
    code = code.replace(
        "import { useState } from 'react';",
        "import { useState } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
    );
}

const target = '{/* Receipt Preview Modal */}\n      {activeReceipt && (';
const repl = '{/* Receipt Preview Modal */}\n      {activeReceipt && (\n        <Portal>';
code = code.replace(target, repl);

code = code.replace(
    /<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
    '</Button>\n              </div>\n            </div>\n          </div>\n        </div>\n        </Portal>\n      )}'
);

fs.writeFileSync('src/pages/shared/ClaimDetail.tsx', code);
