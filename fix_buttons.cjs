const fs = require('fs');

function addToast(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    if (!code.includes('useToast')) {
        // Add import
        code = code.replace(
            "import { useAppContext } from '../../components/AppContext';",
            "import { useAppContext } from '../../components/AppContext';\nimport { useToast } from '../../components/shared/ToastContext';"
        );
        // Add hook
        code = code.replace(
            "const navigate = useNavigate();",
            "const navigate = useNavigate();\n  const { addToast } = useToast();"
        );
        // AdminDashboard doesn't have navigate
        if (file.includes('AdminDashboard')) {
            code = code.replace(
                "export function AdminDashboard() {",
                "export function AdminDashboard() {\n  const { addToast } = useToast();"
            );
            if (!code.includes('useToast')) { // in case useAppContext is missing
                code = "import { useToast } from '../../components/shared/ToastContext';\n" + code;
            }
        }
    }

    // Replace <Button ...> and <button ...> without onClick to have onClick={() => addToast('Feature coming soon', 'info')}
    // But we must be careful with regex.
    // Let's just do exact string replacements for the known ones.
    
    code = code.replace(
        '<Button variant="outline" className="gap-2">',
        '<Button variant="outline" className="gap-2" onClick={() => addToast(\'Feature coming soon\', \'info\')}>'
    );
    code = code.replace(
        '<Button variant="secondary" className="w-full font-bold">',
        '<Button variant="secondary" className="w-full font-bold" onClick={() => addToast(\'Feature coming soon\', \'info\')}>'
    );
    code = code.replace(
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none"><span className="material-symbols-outlined text-outline">filter_list</span></button>',
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}><span className="material-symbols-outlined text-outline">filter_list</span></button>'
    );
    code = code.replace(
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none"><span className="material-symbols-outlined text-outline">more_vert</span></button>',
        '<button className="p-1.5 hover:bg-outline-variant rounded-lg transition-colors focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}><span className="material-symbols-outlined text-outline">more_vert</span></button>'
    );
    code = code.replace(
        '<Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary outline-none">',
        '<Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}>'
    );
    code = code.replace(
        '<Button variant="outline" className="gap-2 focus:ring-2 focus:ring-primary outline-none"><span className="material-symbols-outlined">filter_list</span> Filter</Button>',
        '<Button variant="outline" className="gap-2 focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}><span className="material-symbols-outlined">filter_list</span> Filter</Button>'
    );
    code = code.replace(
        '<Button className="gap-2 focus:ring-2 focus:ring-primary outline-none"><span className="material-symbols-outlined">download</span> Export Report</Button>',
        '<Button className="gap-2 focus:ring-2 focus:ring-primary outline-none" onClick={() => addToast(\'Feature coming soon\', \'info\')}><span className="material-symbols-outlined">download</span> Export Report</Button>'
    );
    code = code.replace(
        '<Button variant="secondary" className="gap-2 text-primary font-bold">',
        '<Button variant="secondary" className="gap-2 text-primary font-bold" onClick={() => addToast(\'Feature coming soon\', \'info\')}>'
    );
    
    fs.writeFileSync(file, code);
}

addToast('src/pages/requestor/RequestorDashboard.tsx');
addToast('src/pages/approver/ApproverDashboard.tsx');
addToast('src/pages/custodian/CustodianDashboard.tsx');
addToast('src/pages/admin/AdminDashboard.tsx');

