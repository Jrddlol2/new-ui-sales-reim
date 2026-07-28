const fs = require('fs');

function addToast(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    if (!code.includes('useToast')) {
        // Add hook and import if it has useAppContext
        if (code.includes('useAppContext')) {
            code = code.replace(
                "import { useAppContext }",
                "import { useAppContext } from '../../components/AppContext';\nimport { useToast } from '../../components/shared/ToastContext';\n//"
            );
            
            // Add hook after `const { `
            code = code.replace(
                "const { ",
                "const { addToast } = useToast();\n  const { "
            );
        } else {
            // Need to insert it manually.
            code = "import { useToast } from '../../components/shared/ToastContext';\n" + code;
            code = code.replace(
                /export function [a-zA-Z0-9_]+\(\) \{/,
                "$& \n  const { addToast } = useToast();\n"
            );
        }
    }

    // Replace
    code = code.replace(
        '<Button size="sm" variant="outline" className="border-tertiary text-tertiary">Review Stale Claims</Button>',
        '<Button size="sm" variant="outline" className="border-tertiary text-tertiary" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Review Stale Claims</Button>'
    );
    
    code = code.replace(
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none"><span className="material-symbols-outlined text-outline">filter_list</span></button>',
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}><span className="material-symbols-outlined text-outline">filter_list</span></button>'
    );
    
    code = code.replace(
        '<Button variant="outline">Export PDF</Button>',
        '<Button variant="outline" onClick={() => addToast(\'Export PDF coming soon\', \'info\')}>Export PDF</Button>'
    );
    
    fs.writeFileSync(file, code);
}

const files = [
    'src/pages/approver/ApprovalQueue.tsx',
    'src/pages/shared/ClaimDetail.tsx',
];

for(const file of files) {
    addToast(file);
}

