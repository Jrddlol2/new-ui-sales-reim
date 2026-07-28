import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../components/AppContext';
import { EmptyState } from '../../components/shared/states';

const getIconForSubject = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('reject')) return { icon: 'cancel', color: 'text-red-600', bg: 'bg-red-100' };
  if (s.includes('return') || s.includes('revis')) return { icon: 'edit', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (s.includes('approv')) return { icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-100' };
  if (s.includes('release') || s.includes('claim') || s.includes('payment') || s.includes('disburs')) return { icon: 'payments', color: 'text-teal-600', bg: 'bg-teal-100' };
  if (s.includes('meeting') || s.includes('review')) return { icon: 'event', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (s.includes('advance')) return { icon: 'work', color: 'text-indigo-600', bg: 'bg-indigo-100' };
  if (s.includes('liquidat')) return { icon: 'receipt_long', color: 'text-purple-600', bg: 'bg-purple-100' };
  return { icon: 'notifications', color: 'text-slate-600', bg: 'bg-slate-100' };
};

/** Real system emails already come from the server as SharePoint-style
 *  formatted plain text (headers, greeting, footer all baked into `body` —
 *  see server.ts's sendEmail). No need to re-derive structure; just render it. */
export function Notifications() {
  const { emails, currentUser, markEmailsRead } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myMessages = useMemo(() => {
    return emails
      .filter(e => e.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emails, currentUser.id]);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return myMessages;
    return myMessages.filter(m => m.subject.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
  }, [myMessages, searchQuery]);

  const selectedMessage = useMemo(() => {
    return myMessages.find(m => m.id === selectedId) || filteredMessages[0] || null;
  }, [myMessages, filteredMessages, selectedId]);

  const handleMarkAllRead = () => {
    const unreadIds = myMessages.filter(m => !m.read).map(m => m.id);
    if (unreadIds.length > 0) markEmailsRead(unreadIds);
  };

  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    const msg = myMessages.find(m => m.id === id);
    if (msg && !msg.read) markEmailsRead([id]);
  };

  const unreadCount = myMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-4 w-full h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-semibold text-brand-slate">
          Notifications
          {unreadCount > 0 && <span className="text-primary text-body-base ml-2">({unreadCount} unread)</span>}
        </h1>
      </div>

      {myMessages.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center bg-surface-container-lowest">
          <EmptyState
            icon="mail"
            title="No notifications yet"
            description="You'll see claim, approval, and meeting updates here as the system sends them."
          />
        </Card>
      ) : (
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
                    const isSelected = selectedMessage?.id === msg.id;

                    return (
                      <li
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg.id)}
                        className={`p-4 cursor-pointer hover:bg-brand-row-hover transition-colors flex gap-3 ${isSelected ? 'bg-primary/5' : 'bg-surface-container-lowest'} ${!msg.read ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
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
                          <p className="text-body-sm text-outline truncate">{msg.body.replace(/\s+/g, ' ').trim()}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Right Reading Pane */}
          <div className="flex-1 flex flex-col h-1/2 md:h-full bg-surface-container-lowest relative overflow-y-auto">
            {selectedMessage ? (
              <div className="flex-1 p-6 md:p-10 animate-in fade-in max-w-[800px] mx-auto w-full">
                <div className="mb-8 border border-brand-border rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="bg-brand-table-header px-6 py-4 border-b border-brand-border flex items-start gap-4">
                    {(() => {
                      const iconConfig = getIconForSubject(selectedMessage.subject);
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
                          <span className="truncate text-brand-slate">{selectedMessage.from}</span>
                        </div>
                        <div className="flex">
                          <span className="w-12 inline-block text-on-surface-variant font-medium">Sent:</span>
                          <span>{new Date(selectedMessage.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex">
                          <span className="w-12 inline-block text-on-surface-variant font-medium">To:</span>
                          <span className="truncate">{selectedMessage.to}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-white text-on-surface-variant">
                    <div className="text-body-base whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.body}
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
      )}
    </div>
  );
}
