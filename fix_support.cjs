const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/Support.tsx', 'utf8');

if (!code.includes('import { Portal }')) {
    code = code.replace(
        "import { useState } from 'react';",
        "import { useState } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
    );
}

// Support page has New Ticket Modal
const target1 = '{/* New Ticket Modal */}\n      {showNewTicketModal && (';
const replacement1 = '{/* New Ticket Modal */}\n      {showNewTicketModal && (\n        <Portal>';
code = code.replace(target1, replacement1);

// We find the closing brace for New Ticket Modal
// It ends with: 
/*
              <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
            </div>
          </div>
        </div>
      )}
*/
code = code.replace(
    /<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
    '</Button>\n            </div>\n          </div>\n        </div>\n        </Portal>\n      )}'
);

fs.writeFileSync('src/pages/shared/Support.tsx', code);
