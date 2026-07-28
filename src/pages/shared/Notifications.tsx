import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// TODO(claude): wire to /api/outbox for the current user
export interface NotificationMessage {
  id: string;
  type: 'APPROVED' | 'REJECTED' | 'PENDING' | 'READY_FOR_RELEASE' | 'MEETING_SCHEDULED' | 'NEW_REQUEST' | 'REVISION_REQUESTED' | 'CASH_ADVANCE' | 'LIQUIDATION' | 'SYSTEM';
  subject: string;
  sender: string;
  recipient: string;
  cc?: string;
  timestamp: string;
  read: boolean;
  greeting: string;
  mainMessage: string;
  referenceNumber?: string;
  referenceUrl?: string;
  status?: string;
  actionRequired?: string;
  additionalDetails?: { label: string; value: string }[];
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'APPROVED': return { icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-100' };
    case 'REJECTED': return { icon: 'cancel', color: 'text-red-600', bg: 'bg-red-100' };
    case 'PENDING': return { icon: 'pending', color: 'text-orange-600', bg: 'bg-orange-100' };
    case 'READY_FOR_RELEASE': return { icon: 'payments', color: 'text-teal-600', bg: 'bg-teal-100' };
    case 'MEETING_SCHEDULED': return { icon: 'event', color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'NEW_REQUEST': return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'REVISION_REQUESTED': return { icon: 'edit', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case 'CASH_ADVANCE': return { icon: 'work', color: 'text-indigo-600', bg: 'bg-indigo-100' };
    case 'LIQUIDATION': return { icon: 'receipt_long', color: 'text-purple-600', bg: 'bg-purple-100' };
    default: return { icon: 'notifications', color: 'text-slate-600', bg: 'bg-slate-100' };
  }
};

const placeholderMessages: NotificationMessage[] = [
  {
    id: 'msg-1',
    type: 'APPROVED',
    subject: 'Claim REIM-001 Approved',
    sender: 'MicroGenesis Sales Reimbursement System',
    recipient: 'Current User',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    greeting: 'Hello,',
    mainMessage: 'Your claim for "Client Lunch" has been approved by your manager and is now queued for disbursement.',
    referenceNumber: 'REIM-001',
    referenceUrl: '/claim/REIM-001',
    status: 'Approved',
    additionalDetails: [
      { label: 'Amount', value: '₱ 2,500.00' },
      { label: 'Approver', value: 'Jane Manager' },
    ]
  },
  {
    id: 'msg-2',
    type: 'REVISION_REQUESTED',
    subject: 'Action Required: Update MOM',
    sender: 'MicroGenesis Sales Reimbursement System',
    recipient: 'Current User',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    greeting: 'Hi,',
    mainMessage: 'Please review and update the Minutes of Meeting for your recent visit to Acme Corp. Attach the signed PDF.',
    actionRequired: 'Update MOM and attach the signed PDF.',
    referenceNumber: 'MOM-2023-085',
    referenceUrl: '/moms',
    status: 'Revision Requested',
    additionalDetails: [
      { label: 'Company', value: 'Acme Corp' },
      { label: 'Meeting Date', value: 'Oct 24, 2023' },
    ]
  },
  {
    id: 'msg-3',
    type: 'SYSTEM',
    subject: 'Welcome to the New Reimbursement Portal',
    sender: 'MicroGenesis Sales Reimbursement System',
    recipient: 'Current User',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    greeting: 'Welcome!',
    mainMessage: 'We have updated our internal systems. You can now submit claims and view your history directly from your dashboard.\n\nTake a look around and let us know what you think!',
  }
];

export interface NotificationsProps {
  messages?: NotificationMessage[];
}

export function Notifications({ messages = placeholderMessages }: NotificationsProps) {
  const [localMessages, setLocalMessages] = useState(messages);
  const [selectedId, setSelectedId] = useState<string | null>(messages.length > 0 ? messages[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = useMemo(() => {
    return localMessages.filter(m => 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.mainMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localMessages, searchQuery]);

  const selectedMessage = useMemo(() => {
    return localMessages.find(m => m.id === selectedId) || null;
  }, [localMessages, selectedId]);

  const handleMarkAllRead = () => {
    setLocalMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const unreadCount = localMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-4 w-full h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-semibold text-brand-slate">
          Notifications 
          {unreadCount > 0 && <span className="text-primary text-body-base ml-2">({unreadCount} unread)</span>}
        </h1>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col md:flex-row bg-surface-container-lowest !p-0">
        {/* Left List */}
        <div className="w-full md:w-[320px] lg:w-[400px] border-b md:border-b-0 md:border-r border-brand-border flex flex-col h-1/2 md:h-full">
          <div className="p-4 border-b border-brand-border space-y-3 bg-surface-container-lowest">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <Input 
                placeholder="Search inbox..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-label-sm text-outline font-medium uppercase tracking-wider">Inbox</span>
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-[12px] h-auto py-1 px-2 text-primary hover:bg-primary/10">
                Mark all read
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-outline flex flex-col items-center">
                <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">inbox_customize</span>
                <p className="text-body-sm font-medium text-brand-slate">Nothing found</p>
                <p className="text-[12px] mt-1 max-w-[200px]">No messages match your search criteria.</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {filteredMessages.map(msg => {
                  const date = new Date(msg.timestamp);
                  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  
                  return (
                    <li 
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={`p-4 cursor-pointer hover:bg-brand-row-hover transition-colors flex gap-3 ${selectedId === msg.id ? 'bg-primary/5' : 'bg-surface-container-lowest'} ${!msg.read ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <div className="pt-1.5 flex-shrink-0">
                        {msg.read ? (
                          <div className="w-2 h-2 rounded-full bg-transparent" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-label-md truncate pr-2 ${!msg.read ? 'font-semibold text-brand-slate' : 'font-medium text-on-surface-variant'}`}>
                            {msg.subject}
                          </h4>
                          <span className="text-[11px] text-outline whitespace-nowrap">{dateStr}</span>
                        </div>
                        <p className="text-body-sm text-outline truncate">{msg.mainMessage}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Reading Pane */}
        <div className="flex-1 flex flex-col h-1/2 md:h-full bg-surface-container-lowest relative overflow-y-auto">
          {selectedMessage ? (
            <div className="flex-1 p-6 md:p-10 animate-in fade-in max-w-[800px] mx-auto w-full">
              
              {/* Email Header Area */}
              <div className="mb-8 border border-brand-border rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-brand-table-header px-6 py-4 border-b border-brand-border flex items-start gap-4">
                  {(() => {
                    const iconConfig = getIconForType(selectedMessage.type);
                    return (
                      <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconConfig.bg} ${iconConfig.color}`}>
                        <span className="material-symbols-outlined">{iconConfig.icon}</span>
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-headline-sm font-semibold text-brand-slate mb-1">{selectedMessage.subject}</h2>
                    <div className="text-body-sm text-outline space-y-1">
                      <div className="flex">
                        <span className="w-12 inline-block text-on-surface-variant font-medium">From:</span>
                        <span className="truncate text-brand-slate">{selectedMessage.sender}</span>
                      </div>
                      <div className="flex">
                        <span className="w-12 inline-block text-on-surface-variant font-medium">Sent:</span>
                        <span>{new Date(selectedMessage.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex">
                        <span className="w-12 inline-block text-on-surface-variant font-medium">To:</span>
                        <span className="truncate">{selectedMessage.recipient}</span>
                      </div>
                      {selectedMessage.cc && (
                        <div className="flex">
                          <span className="w-12 inline-block text-on-surface-variant font-medium">CC:</span>
                          <span className="truncate">{selectedMessage.cc}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Body Area */}
                <div className="p-6 md:p-8 bg-white text-on-surface-variant">
                  <p className="text-body-base font-medium text-brand-slate mb-4">{selectedMessage.greeting}</p>
                  
                  <div className="text-body-base mb-6 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.mainMessage}
                  </div>

                  {/* Structured Details Box */}
                  {(selectedMessage.referenceNumber || selectedMessage.status || selectedMessage.actionRequired || selectedMessage.additionalDetails) && (
                    <div className="bg-surface-container-lowest border border-brand-border rounded p-4 mb-6 space-y-3">
                      {selectedMessage.referenceNumber && (
                        <div className="flex gap-2">
                          <span className="text-body-sm font-medium text-brand-slate w-32">Reference:</span>
                          {selectedMessage.referenceUrl ? (
                            <Link to={selectedMessage.referenceUrl} className="text-body-sm text-primary hover:underline font-medium">
                              {selectedMessage.referenceNumber}
                            </Link>
                          ) : (
                            <span className="text-body-sm text-on-surface-variant">{selectedMessage.referenceNumber}</span>
                          )}
                        </div>
                      )}
                      {selectedMessage.status && (
                        <div className="flex gap-2">
                          <span className="text-body-sm font-medium text-brand-slate w-32">Status:</span>
                          <span className="text-body-sm text-on-surface-variant">{selectedMessage.status}</span>
                        </div>
                      )}
                      {selectedMessage.actionRequired && (
                        <div className="flex gap-2">
                          <span className="text-body-sm font-medium text-error w-32">Action Required:</span>
                          <span className="text-body-sm text-error font-medium">{selectedMessage.actionRequired}</span>
                        </div>
                      )}
                      {selectedMessage.additionalDetails?.map((detail, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-body-sm font-medium text-brand-slate w-32">{detail.label}:</span>
                          <span className="text-body-sm text-on-surface-variant">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Email Footer Area */}
                  <div className="mt-12 pt-6 border-t border-brand-border text-[11px] text-outline leading-tight">
                    <p className="mb-1">This is an automatically generated notification.</p>
                    <p className="mb-3">Please do not reply.</p>
                    <p className="font-medium text-brand-slate opacity-70">MicroGenesis Sales Reimbursement System</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-outline p-8 text-center bg-surface-container-low/30">
               <span className="material-symbols-outlined text-[48px] mb-4 opacity-20">mail</span>
               <p className="text-body-base font-medium">Select a message</p>
               <p className="text-[12px] mt-1">Choose a notification from the inbox to read.</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
}
