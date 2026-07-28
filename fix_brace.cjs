const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');
code = code.replace(/<\/div>\s*\}\}\s*\{\/\* Preview Modal \*\/\}/g, '</div>\n      )}\n      {/* Preview Modal */}');
fs.writeFileSync('src/pages/shared/Receipts.tsx', code);
