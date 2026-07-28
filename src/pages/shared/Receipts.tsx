import { useState, useRef } from 'react';
import { Portal } from '../../components/shared/Portal';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useAppContext } from '../../components/AppContext';
import { useToast } from '../../components/shared/ToastContext';

interface ReceiptRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  claimRef?: string;
  claimId?: string;
}

export function Receipts() {
  const { lineItems, claims, setLineItems } = useAppContext();
  const { addToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New receipt upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVendor, setUploadVendor] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Meals');
  const [uploadAmount, setUploadAmount] = useState('');
  const [uploadClaimId, setUploadClaimId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive real receipts from line items in context
  const derivedReceipts: ReceiptRecord[] = lineItems
    .filter(item => item.receiptUrl)
    .map(item => {
      const parentClaim = claims.find(c => c.id === item.claimId);
      return {
        id: item.id,
        fileName: item.receiptFileName || `Receipt_${item.vendor || item.category}.pdf`,
        fileUrl: item.receiptUrl!,
        category: item.category,
        vendor: item.vendor || 'Vendor N/A',
        amount: item.amount,
        date: item.expenseDate,
        claimRef: parentClaim?.ref,
        claimId: item.claimId
      };
    });

  const filteredReceipts = derivedReceipts.filter(r => {
    const matchesSearch = 
      r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.claimRef && r.claimRef.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStandaloneUpload = () => {
    if (!uploadFile) {
      addToast('Please select a receipt file to upload', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    const newItem = {
      id: `li-standalone-${Date.now()}`,
      claimId: uploadClaimId || (claims[0]?.id || 'c1'),
      expenseDate: new Date().toISOString().split('T')[0],
      vendor: uploadVendor || 'Independent Receipt',
      category: uploadCategory,
      amount: Number(uploadAmount) || 0,
      paymentMethod: 'Personal Card',
      businessPurpose: 'Uploaded to archive',
      receiptUrl: objectUrl,
      receiptFileName: uploadFile.name
    };

    setLineItems(prev => [newItem, ...prev]);
    addToast('Receipt uploaded to archive successfully!', 'success');
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadVendor('');
    setUploadAmount('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display text-on-surface">Receipt Archive</h1>
          <p className="text-body-md text-outline mt-1">Searchable library of verified receipt documents & official receipts.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowUploadModal(true)}>
          <span className="material-symbols-outlined">upload</span> Upload Receipt
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="flex-1">
          <Input 
            type="text" 
            placeholder="Search by filename, vendor, or claim ref..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Meals">Meals</option>
            <option value="Travel">Travel</option>
            <option value="Supplies">Supplies</option>
            <option value="Lodging">Lodging</option>
            <option value="Transportation">Transportation</option>
            <option value="Utilities">Utilities</option>
          </Select>
        </div>
      </div>

      {/* Receipts Grid */}
      {filteredReceipts.length === 0 ? (
        <Card className="p-12 text-center text-outline">
          <span className="material-symbols-outlined text-[48px] mb-3">folder_open</span>
          <p className="font-headline-sm text-on-surface mb-1">No Receipts Found</p>
          <p className="text-sm">Upload receipts during claim submission or directly to this archive.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReceipts.map(receipt => (
            <Card 
              key={receipt.id} 
              className="overflow-hidden hover:border-primary transition-all cursor-pointer group hover:shadow-md"
              onClick={() => setSelectedReceipt(receipt)}
            >
              <div className="h-36 bg-surface-container-high flex flex-col items-center justify-center relative p-4">
                <span className="material-symbols-outlined text-4xl text-primary mb-1">receipt_long</span>
                <span className="text-xs font-mono-data font-semibold text-on-surface text-center truncate max-w-full px-2">
                  {receipt.fileName}
                </span>
                <span className="text-[10px] uppercase font-bold text-outline mt-1 bg-surface-container px-2 py-0.5 rounded">
                  {receipt.category}
                </span>
              </div>
              <CardContent className="p-4 bg-surface-container-lowest">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-label-md text-on-surface font-semibold truncate">{receipt.vendor}</p>
                  <p className="font-mono-data font-bold text-primary">${receipt.amount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-outline mt-2 pt-2 border-t border-outline-variant/40">
                  <span>{receipt.date}</span>
                  {receipt.claimRef && (
                    <span className="bg-primary-container/20 text-primary font-mono-data px-1.5 py-0.5 rounded text-[11px]">
                      {receipt.claimRef}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
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
                <span className="ml-4 text-outline">Amount:</span> <span className="font-mono-data font-bold text-primary">${selectedReceipt.amount.toFixed(2)}</span>
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
      )}
      {/* Upload Modal */}
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
                    <option key={c.id} value={c.id}>{c.ref} - ${c.total.toFixed(2)} ({c.type})</option>
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
      )}
    </div>
  );
}