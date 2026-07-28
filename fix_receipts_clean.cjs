const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/Receipts.tsx', 'utf8');

// The file is currently messed up. I will do a regex to just capture the whole return block and rewrite it properly.
// The easiest way is to use an AST parser or just do exact replacements.

code = code.replace(/<Portal>/g, '');
code = code.replace(/<\/Portal>/g, '');
code = code.replace(/import \{ Portal \} from '\.\.\/\.\.\/components\/shared\/Portal';\n/g, '');
code = code.replace(/import \{ createPortal \} from 'react-dom';\n/g, '');

// Fix bad brackets
// I will just replace the whole modal sections with the correct ones.

const originalPreviewModal = `{/* Preview Modal */}
      {selectedReceipt && (
        <Portal>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-headline-sm text-on-surface">{selectedReceipt.fileName}</h3>
                <p className="text-xs text-outline">{selectedReceipt.vendor} • {selectedReceipt.date}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-8 flex flex-col items-center justify-center min-h-[260px]">
              {selectedReceipt.fileUrl.startsWith('data:image') || selectedReceipt.fileUrl.startsWith('blob:') ? (
                <img src={selectedReceipt.fileUrl} alt="Receipt preview" className="max-h-64 object-contain rounded" />
              ) : (
                <div className="text-center space-y-2">
                  <span className="material-symbols-outlined text-[64px] text-primary">description</span>
                  <p className="font-bold text-on-surface">{selectedReceipt.fileName}</p>
                  <p className="text-xs text-outline">Document attachment linked to {selectedReceipt.claimRef || 'Receipt Archive'}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <div>
                <span className="text-outline">Category:</span> <span className="font-semibold text-on-surface">{selectedReceipt.category}</span>
                <span className="ml-4 text-outline">Amount:</span> <span className="font-mono-data font-bold text-primary">\${selectedReceipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <a href={selectedReceipt.fileUrl} target="_blank" rel="noreferrer" download={selectedReceipt.fileName}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <span className="material-symbols-outlined text-[16px]">download</span> Download
                  </Button>
                </a>
                <Button size="sm" onClick={() => setSelectedReceipt(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
        </Portal>
      )}`;

const originalUploadModal = `{/* Upload Modal */}
      {showUploadModal && (
        <Portal>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-headline-sm text-on-surface">Upload Stray Receipt</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-label-sm block mb-1">Select Receipt File</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  ref={fileInputRef} 
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-outline file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:opacity-90" 
                />
              </div>
              <div>
                <label className="font-label-sm block mb-1">Vendor / Merchant</label>
                <Input type="text" value={uploadVendor} onChange={e => setUploadVendor(e.target.value)} placeholder="e.g. Starbucks, Shell, Uber" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-sm block mb-1">Category</label>
                  <Select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                    <option value="Meals">Meals</option>
                    <option value="Travel">Travel</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                  </Select>
                </div>
                <div>
                  <label className="font-label-sm block mb-1">Amount ($)</label>
                  <Input type="number" value={uploadAmount} onChange={e => setUploadAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="font-label-sm block mb-1">Link to Claim (Optional)</label>
                <Select value={uploadClaimId} onChange={e => setUploadClaimId(e.target.value)}>
                  <option value="">Unlinked Standalone Receipt</option>
                  {claims.map(c => (
                    <option key={c.id} value={c.id}>{c.ref} - \${c.total.toFixed(2)} ({c.type})</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button onClick={handleStandaloneUpload}>Upload & Save</Button>
            </div>
          </div>
        </div>
        </Portal>
      )}`;

const prefix = code.split('{/* Preview Modal */}')[0];
let newCode = prefix + originalPreviewModal + "\n      " + originalUploadModal + "\n    </div>\n  );\n}";

newCode = newCode.replace(
    "import { useState, useRef } from 'react';",
    "import { useState, useRef } from 'react';\nimport { Portal } from '../../components/shared/Portal';"
);

// fix any remaining document.body
newCode = newCode.replace(/<\/div>,\s*document\.body\s*}\)/g, '</div>\n      )}');
newCode = newCode.replace(/,\s*document\.body\s*\)/g, '\n      )}');

fs.writeFileSync('src/pages/shared/Receipts.tsx', newCode);
