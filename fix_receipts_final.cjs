const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');

// Undo createPortal attempts
code = code.replace(/import { createPortal } from 'react-dom';/g, '');
code = code.replace(/createPortal\(\s*/g, '');
code = code.replace(/,\s*document\.body\s*\)/g, '\n      )}');
// fix line 168 comma
code = code.replace(/<\/div>,\s*document\.body\s*}\)/g, '</div>\n      )}');

// Import Portal
if (!code.includes('Portal')) {
    code = code.replace(
        "import { useState, useRef } from 'react';",
        "import { useState, useRef } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
    );
}

// Wrap modals.
// We can use the fact that the fixed inset-0 div is immediately followed by a comment in our source? No, it follows the comment.
// For Preview Modal
code = code.replace(
    /\{\/\* Preview Modal \*\/\}\s*\{selectedReceipt && \(\s*<div className="fixed inset-0/g,
    '{/* Preview Modal */}\n      {selectedReceipt && (\n        <Portal>\n        <div className="fixed inset-0'
);
// For Upload Modal
code = code.replace(
    /\{\/\* Upload Modal \*\/\}\s*\{showUploadModal && \(\s*<div className="fixed inset-0/g,
    '{/* Upload Modal */}\n      {showUploadModal && (\n        <Portal>\n        <div className="fixed inset-0'
);

// Add the closing Portal tag
// Preview Modal ends with:
/*
                <Button size="sm" onClick={() => setSelectedReceipt(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
*/
code = code.replace(
    /<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g,
    '</Button>\n              </div>\n            </div>\n          </div>\n        </div>\n        </Portal>\n      )}'
);

// Upload Modal ends with:
/*
              <Button onClick={handleStandaloneUpload}>Upload & Save</Button>
            </div>
          </div>
        </div>
      )}
*/
code = code.replace(
    /<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g,
    '</Button>\n            </div>\n          </div>\n        </div>\n        </Portal>\n      )}'
);

fs.writeFileSync('src/pages/shared/Receipts.tsx', code);
