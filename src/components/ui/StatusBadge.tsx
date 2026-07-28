import { ClaimStatus } from '../../types';

export function StatusBadge({ status }: { status: ClaimStatus }) {
  let bgColor = 'bg-surface-container-highest';
  let textColor = 'text-on-surface-variant';
  
  switch (status) {
    case ClaimStatus.DRAFT:
      bgColor = 'bg-[#64748B]/10';
      textColor = 'text-[#64748B]';
      break;
    case ClaimStatus.SUBMITTED:
    case ClaimStatus.REVIEW_MEETING_SCHEDULED:
      bgColor = 'bg-[#3B82F6]/10'; // Blue
      textColor = 'text-[#3B82F6]';
      break;
    case ClaimStatus.PENDING_APPROVAL:
      bgColor = 'bg-[#D97706]/10'; // Amber/Orange
      textColor = 'text-[#D97706]';
      break;
    case ClaimStatus.APPROVED:
    case ClaimStatus.PROCESSING:
      bgColor = 'bg-[#8B5CF6]/10'; // Purple
      textColor = 'text-[#8B5CF6]';
      break;
    case ClaimStatus.READY_FOR_CLAIM:
    case ClaimStatus.COMPLETED:
      bgColor = 'bg-[#0D9488]/10'; // Teal
      textColor = 'text-[#0D9488]';
      break;
    case ClaimStatus.REJECTED:
      bgColor = 'bg-[#E11D48]/10'; // Rose/Red
      textColor = 'text-[#E11D48]';
      break;
    case ClaimStatus.RETURNED:
      bgColor = 'bg-[#F59E0B]/10'; // Yellow
      textColor = 'text-[#F59E0B]';
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}
