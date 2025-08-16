
export enum DealStage {
  LEAD = 'Lead',
  CONTACTED = 'Contacted',
  PROPOSAL = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  WON = 'Won',
  LOST = 'Lost',
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  stage: DealStage;
  quoteAmount: number;
  lastContact: string; // ISO date string
  meetingDate?: string; // ISO date string
  notes: string;
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: string;
  text: string;
  isDone: boolean;
  dueDate: string; // ISO date string
  priority: TaskPriority;
  clientId: string; // Link to Client ID
  clientName: string; // Denormalized for easy display
}
