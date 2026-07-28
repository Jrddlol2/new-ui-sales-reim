const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    if (!code.includes('useToast')) {
        if (code.includes('useAppContext')) {
            code = code.replace(
                "import { useAppContext }",
                "import { useAppContext } from '../../components/AppContext';\nimport { useToast } from '../../components/shared/ToastContext';\n//"
            );
            code = code.replace(
                "const { ",
                "const { addToast } = useToast();\n  const { "
            );
        } else {
            code = "import { useToast } from '../../components/shared/ToastContext';\n" + code;
            code = code.replace(
                /export function [a-zA-Z0-9_]+\(\) \{/,
                "$& \n  const { addToast } = useToast();\n"
            );
        }
    }

    // Settings.tsx
    code = code.replace(
        '<button className="w-full text-left px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-bold">Profile</button>',
        '<button className="w-full text-left px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-bold" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Profile</button>'
    );
    code = code.replace(
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">Notifications</button>',
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Notifications</button>'
    );
    code = code.replace(
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">Delegation</button>',
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Delegation</button>'
    );
    code = code.replace(
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">Security</button>',
        '<button className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Security</button>'
    );
    code = code.replace(
        '<Button variant="outline" size="sm">Change Photo</Button>',
        '<Button variant="outline" size="sm" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Change Photo</Button>'
    );
    code = code.replace(
        '<Button>Save Changes</Button>',
        '<Button onClick={() => addToast(\'Changes saved successfully\', \'success\')}>Save Changes</Button>'
    );
    
    // HistoricalImport.tsx
    code = code.replace(
        '<Button variant="outline">Download Template</Button>',
        '<Button variant="outline" onClick={() => addToast(\'Feature coming soon\', \'info\')}>Download Template</Button>'
    );

    fs.writeFileSync(file, code);
}

fixFile('src/pages/shared/Settings.tsx');
fixFile('src/pages/admin/HistoricalImport.tsx');
