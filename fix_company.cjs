const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/CompanyDirectory.tsx', 'utf8');

if (!code.includes('import { Portal }')) {
    code = code.replace(
        "import { useState } from 'react';",
        "import { useState } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
    );
}

const target = '{showModal && (';
const repl = '{showModal && (\n        <Portal>';
code = code.replace(target, repl);

code = code.replace(
    "        </div>\n      )}\n    </div>\n  );\n}",
    "        </div>\n        </Portal>\n      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/admin/CompanyDirectory.tsx', code);
