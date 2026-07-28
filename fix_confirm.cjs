const fs = require('fs');
let code = fs.readFileSync('src/components/shared/ConfirmModal.tsx', 'utf8');

if (!code.includes('import { Portal }')) {
    code = code.replace(
        "import { Button } from '../ui/Button';",
        "import { Button } from '../ui/Button';\nimport { Portal } from './Portal';"
    );
}

const target = '  return (\n    <div className="fixed inset-0';
const repl = '  return (\n    <Portal>\n    <div className="fixed inset-0';
code = code.replace(target, repl);

code = code.replace(
    "      </div>\n    </div>\n  );\n}",
    "      </div>\n    </div>\n    </Portal>\n  );\n}"
);

fs.writeFileSync('src/components/shared/ConfirmModal.tsx', code);
