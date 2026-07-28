import { MOM } from '../../types';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export interface MomDetailProps {
  mom?: MOM;
}

// TODO(claude): wire to real MOM + file URL
const placeholderMom: MOM = {
  id: 'mom-001',
  claimId: 'claim-001',
  companyName: 'Acme Corp',
  typeOfAccount: 'Enterprise Client',
  meetingDate: '2023-10-25T14:30:00Z',
  status: 'Published',
  source: 'Uploaded' as any,
  fileName: 'acme_q3_review.pdf',
  fileUrl: '#',
  purposeOfMeeting: 'Q3 Business Review and Renewal Discussion',
  category: 'Business Review',
  location: 'Virtual (Zoom)',
  contactPerson: 'Jane Doe',
  contactPersonDesignation: 'VP of Procurement',
  contactPersonEmail: 'jane.doe@acmecorp.com',
  meetingType: 'External',
  description: 'Discussed Q3 performance metrics, resolved outstanding support tickets, and presented the updated SLA for the upcoming contract renewal.',
  agreements: 'Agreed to a 5% discount on the renewal for a 2-year commitment.',
  actionItems: '1. Send updated SLA draft by Friday.\n2. Schedule follow-up with technical team.',
  preparedBy: 'John Smith',
  participantsInternal: 'John Smith, Alice Johnson',
  participantsExternal: 'Jane Doe, Bob Brown',
};

export function MomDetail({ mom = placeholderMom }: MomDetailProps) {
  const dateStr = mom.meetingDate ? new Date(mom.meetingDate).toLocaleString() : 'No date specified';

  const internalParticipants = mom.participantsInternal?.split(',').map(p => p.trim()).filter(Boolean) || [];
  const externalParticipants = mom.participantsExternal?.split(',').map(p => p.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <h2 className="text-headline-md font-semibold text-brand-slate">
              {mom.companyName || 'Unknown Company'}
            </h2>
            <p className="text-body-sm text-outline mt-1">
              {mom.typeOfAccount} &bull; {dateStr}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">
              {mom.status || 'Draft'}
            </span>
            <Button variant="outline" className="gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <section>
              <h3 className="text-label-sm uppercase tracking-wider text-outline mb-3">Meeting Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-label-sm text-outline">Purpose</dt>
                  <dd className="text-body-base font-medium mt-1">{mom.purposeOfMeeting || '-'}</dd>
                </div>
                <div>
                  <dt className="text-label-sm text-outline">Location</dt>
                  <dd className="text-body-base font-medium mt-1">{mom.location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-label-sm text-outline">Meeting Type</dt>
                  <dd className="text-body-base font-medium mt-1">{mom.meetingType || '-'}</dd>
                </div>
                <div>
                  <dt className="text-label-sm text-outline">Category</dt>
                  <dd className="text-body-base font-medium mt-1">{mom.category || '-'}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-label-sm uppercase tracking-wider text-outline mb-3">Contact Person</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-label-sm text-outline">Name & Designation</dt>
                  <dd className="text-body-base font-medium mt-1">
                    {mom.contactPerson || '-'}
                    {mom.contactPersonDesignation ? ` (${mom.contactPersonDesignation})` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-label-sm text-outline">Email</dt>
                  <dd className="text-body-base font-medium mt-1">{mom.contactPersonEmail || '-'}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-label-sm uppercase tracking-wider text-outline mb-3">Participants</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-label-sm text-outline block mb-2">Internal</span>
                  {internalParticipants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {internalParticipants.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-body-sm text-outline">None listed</span>
                  )}
                </div>
                <div>
                  <span className="text-label-sm text-outline block mb-2">External</span>
                  {externalParticipants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {externalParticipants.map((p, i) => (
                        <span key={i} className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm border border-brand-border">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-body-sm text-outline">None listed</span>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-label-sm uppercase tracking-wider text-outline mb-3">Discussion & Outcomes</h3>
              <div className="space-y-4 bg-surface-container-lowest border border-brand-border rounded-[10px] p-4">
                <div>
                  <h4 className="text-label-sm font-semibold mb-1">Summary / Description</h4>
                  <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">{mom.description || mom.summary || 'No description provided.'}</p>
                </div>
                
                {mom.agreements && (
                  <div>
                    <h4 className="text-label-sm font-semibold mb-1">Agreements</h4>
                    <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">{mom.agreements}</p>
                  </div>
                )}

                {mom.actionItems && (
                  <div>
                    <h4 className="text-label-sm font-semibold mb-1">Action Items</h4>
                    <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">{mom.actionItems}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
             <section className="h-full flex flex-col">
                <h3 className="text-label-sm uppercase tracking-wider text-outline mb-3">Attached Document</h3>
                
                {mom.fileUrl ? (
                  <div className="flex flex-col flex-1 border border-brand-border rounded-[10px] overflow-hidden bg-surface-container-low min-h-[400px]">
                    <div className="p-3 border-b border-brand-border flex items-center justify-between bg-surface-container-lowest">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline">description</span>
                        <span className="text-label-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                          {mom.fileName || 'document.pdf'}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-4">
                      {/* Embedded viewer area */}
                      {mom.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={mom.fileUrl} alt="Attachment Preview" className="max-w-full max-h-full object-contain rounded" />
                      ) : (
                        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-surface-container rounded border border-brand-border border-dashed">
                          <div className="text-center text-outline">
                            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">picture_as_pdf</span>
                            <p className="text-body-sm">PDF Preview Area</p>
                            <p className="text-[11px] mt-1">If browser supports inline viewing</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[200px] border border-brand-border border-dashed rounded-[10px] bg-surface-container-low flex flex-col items-center justify-center p-6 text-center text-outline">
                    <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">draft</span>
                    <p className="text-body-sm font-medium">No file attached</p>
                    <p className="text-[12px] mt-1 max-w-[250px]">
                      This MOM was created via template or the document has not been uploaded yet.
                    </p>
                  </div>
                )}
             </section>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
