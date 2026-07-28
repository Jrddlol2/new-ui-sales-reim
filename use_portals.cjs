const fs = require('fs');
const glob = require('glob');

// We have src/components/shared/Portal.tsx
const files = [
  'src/pages/shared/Receipts.tsx',
  'src/pages/shared/Support.tsx',
  'src/pages/shared/ClaimDetail.tsx',
  'src/pages/admin/CompanyDirectory.tsx',
  'src/pages/admin/SystemEmails.tsx',
  'src/components/shared/ConfirmModal.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // First, if it has `createPortal`, remove it and document.body
  code = code.replace(/createPortal\(\s*/g, '');
  code = code.replace(/,\s*document\.body\s*\)/g, '');
  // Fix the comma on Receipts.tsx line 168 if present
  code = code.replace(/<\/div>,\s*document\.body\s*}\)/g, '</div>\n      )}');

  // Add Portal import
  const portalImport = "import { Portal } from '../../components/shared/Portal';";
  if (!code.includes('import { Portal }')) {
    // Try to insert after the first import or similar
    if (file.includes('components/shared/ConfirmModal.tsx')) {
        code = code.replace("import { Button }", "import { Portal } from './Portal';\nimport { Button }");
    } else {
        code = code.replace("import { useState", portalImport + "\nimport { useState");
    }
  }

  // Wrap `<div className="fixed inset-0...` with `<Portal>`
  code = code.replace(/<div className="fixed inset-0([^>]*)>/g, '<Portal><div className="fixed inset-0$1>');
  
  // We need to close the portal.
  // This is tricky via regex because the div might have children.
  // But wait! If we do a simpler approach: 
  // Let's just find the corresponding closing </div>. But regex can't count divs well.
  // Instead, let's just restore the file and manually apply.
}
