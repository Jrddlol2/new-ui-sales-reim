const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');
layoutCode = layoutCode.replace(/lg:pl-\[260px\]/g, 'lg:pl-[240px]');
fs.writeFileSync('src/components/layout/Layout.tsx', layoutCode);

let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(/w-\[260px\]/g, 'w-[240px]');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode);
