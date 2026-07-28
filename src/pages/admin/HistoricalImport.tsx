import React from "react";
import { useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/shared/ToastContext';
import { useAppContext } from '../../components/AppContext';

export function HistoricalImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting import for ${file.name}...`]);

    // Simulate CSV parsing and historical data import
    setTimeout(() => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found 142 records.`]);
    }, 1000);

    setTimeout(() => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validating data integrity against Master Data...`]);
    }, 2500);

    setTimeout(() => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validation passed. Importing...`]);
    }, 4000);

    setTimeout(() => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Import completed successfully! 142 claims added to history.`]);
      setIsUploading(false);
      addToast('Historical data imported successfully', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 5500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display text-on-surface">Historical Import</h1>
          <p className="text-body-md text-outline mt-1">Migrate legacy claims data via CSV import.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined text-[64px] text-primary mb-6">upload_file</span>
            <h3 className="font-headline-md text-on-surface mb-2">Upload CSV Export</h3>
            <p className="text-body-md text-outline mb-8 max-w-sm">Upload a CSV file containing legacy claims. Ensure it matches the system template.</p>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => {
                const csv = 'Date,Amount,Category,Vendor,Purpose\n2024-01-01,150.00,Meals,Acme Corp,Client Dinner';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'claims_import_template.csv';
                a.click();
                addToast('Template downloaded', 'success');
              }}>Download Template</Button>
              <Button 
                className="gap-2" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Importing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">upload</span>
                    Select File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-surface-container-low/50 border-b border-outline-variant">
            <h4 className="font-headline-md text-on-surface">Import Log</h4>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] overflow-y-auto bg-surface-container-lowest p-6 font-mono-data text-sm">
              {logs.length === 0 ? (
                <p className="text-outline italic">No active imports. Upload a file to begin.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <p key={idx} className={log.includes('error') ? 'text-error' : log.includes('successfully') ? 'text-green-600' : 'text-on-surface-variant'}>
                      {log}
                    </p>
                  ))}
                  {isUploading && (
                    <p className="text-primary animate-pulse">Processing...</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
