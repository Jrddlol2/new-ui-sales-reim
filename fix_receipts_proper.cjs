const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');

// Revert the wrong replacement
code = code.replace(
    "        </div>,\n        document.body\n      )}\n      {/* Preview Modal */}",
    "        </div>\n      )}\n      {/* Preview Modal */}"
);

// We need to add document.body to the end of Preview Modal
// The Preview Modal ends with:
/*
                <Button size="sm" onClick={() => setSelectedReceipt(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
*/
// It's the first '      )}' after 'Preview Modal' that doesn't have document.body. Let's just use regex.

code = code.replace(
    "        </div>\n      )}\n      {/* Upload Modal */}",
    "        </div>,\n        document.body\n      )}\n      {/* Upload Modal */}"
);

fs.writeFileSync('src/pages/shared/Receipts.tsx', code);
