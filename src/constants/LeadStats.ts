

export type LeadStatusType =
  | 'SCLeads'
  | 'ROLeads'
  | 'AssignedLeads'
  | 'ReassignedLeads'
  | 'RoConfirmationLeads'
  | 'QCLeads'
  | 'QCHoldLeads'
  | 'PricingLeads'
  | 'CompletedLeads'
  | 'OutofTatLeads'
  | 'DuplicateLeads'
  | 'RejectedLeads';
  
export const LEAD_STATUS_ID_MAP: Record<LeadStatusType, string> = {
  SCLeads: '1',
  ROLeads: '2',
  AssignedLeads: '3',
  ReassignedLeads: '4',
  RoConfirmationLeads: '5',
  QCLeads: '6',
  QCHoldLeads: '7',
  PricingLeads: '8',
  CompletedLeads: '9',
  OutofTatLeads: '10',
  DuplicateLeads: '11',
  RejectedLeads: '13',
};

/**
 * Leads In Progress — valuation ke baad aur Completed (9) se pehle ke saare stages.
 * `order` = flow me position; ek lead do list me mile toh aage wala stage dikhega.
 * Naya stage add/remove karna ho toh sirf yahi list badlo.
 */
export const IN_PROGRESS_STAGES: { statusType: LeadStatusType; label: string; order: number }[] = [
  { statusType: 'RoConfirmationLeads', label: 'RO Confirmation', order: 1 },
  { statusType: 'QCLeads', label: 'QC Pending', order: 2 },
  { statusType: 'QCHoldLeads', label: 'QC Hold', order: 3 },
  { statusType: 'PricingLeads', label: 'QC Completed (Pricing)', order: 4 },
];
