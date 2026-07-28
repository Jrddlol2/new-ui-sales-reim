import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { useAppContext } from '../../components/AppContext';
import { ReviewMeetingStatus, ReviewMeeting } from '../../types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_STYLE: Record<string, string> = {
  [ReviewMeetingStatus.CONFIRMED]: 'bg-primary-container text-on-primary-container',
  [ReviewMeetingStatus.PENDING_CONFIRMATION]: 'bg-tertiary-container text-on-tertiary-container',
  [ReviewMeetingStatus.DECLINE_REQUESTED]: 'bg-error-container text-error',
};

export function Calendar() {
  const navigate = useNavigate();
  const { reviewMeetings } = useAppContext();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });

  const { year, month } = cursor;
  const today = new Date();

  // Group meetings by 'YYYY-M-D' so each day cell can look up its own events.
  const byDay = useMemo<Record<string, ReviewMeeting[]>>(() => {
    const map: Record<string, ReviewMeeting[]> = {};
    for (const rm of reviewMeetings) {
      if (!rm.meetingDate) continue;
      const d = new Date(rm.meetingDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[key] ||= []).push(rm);
    }
    return map;
  }, [reviewMeetings, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const step = (delta: number) => setCursor(c => {
    const m = c.month + delta;
    return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
  });

  const totalThisMonth = Object.keys(byDay).reduce((n, key) => n + byDay[key].length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-display text-on-surface">Calendar</h1>
          <p className="text-body-md text-outline mt-1">Schedule and view upcoming review meetings.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-surface-container-low">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-label-md uppercase tracking-wider text-on-surface">{MONTHS[month]} {year}</h3>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-outline mr-2">{totalThisMonth} review meeting{totalThisMonth === 1 ? '' : 's'}</span>
              <button onClick={() => step(-1)} className="p-1.5 rounded-lg hover:bg-outline-variant transition-colors" title="Previous month">
                <span className="material-symbols-outlined text-outline">chevron_left</span>
              </button>
              <button onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })} className="px-3 py-1 rounded-lg text-sm font-label-sm hover:bg-outline-variant transition-colors">Today</button>
              <button onClick={() => step(1)} className="p-1.5 rounded-lg hover:bg-outline-variant transition-colors" title="Next month">
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-label-sm text-outline uppercase pb-2 border-b border-outline-variant">{day}</div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] bg-surface-container-lowest/50 border border-outline-variant/30 rounded-lg"></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const events = byDay[`${year}-${month}-${day}`] || [];
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <div key={day} className={`min-h-[100px] p-2 border rounded-lg transition-colors group ${isToday ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant hover:border-primary'}`}>
                  <span className={`font-label-sm ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {events.map(rm => (
                      <button
                        key={rm.id}
                        onClick={() => navigate(`/claims/${rm.claimId}`)}
                        title={`${rm.claimNumber || 'Claim'} — ${rm.status}${rm.meetingTime ? ` at ${rm.meetingTime}` : ''}`}
                        className={`w-full text-left text-[10px] px-2 py-1 rounded truncate ${STATUS_STYLE[rm.status] || 'bg-surface-container-high text-on-surface'}`}
                      >
                        {rm.meetingTime ? `${rm.meetingTime} ` : ''}{rm.claimNumber || 'Review'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-outline-variant text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-container"></span> Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-tertiary-container"></span> Pending confirmation</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-error-container"></span> Reschedule requested</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
