export interface WatchConfig {
  trtIds: number[];
  dateFrom: string;
  dateTo: string;
  locationNames: Record<number, string>;
}

export interface WatchSlot {
  trtId: number;
  date: string;
  time: string;
  iso: string;
  locationName: string;
}

export interface WatcherStatus {
  configured: boolean;
  lastCheck: string;
  nextCheck?: string;
  trtIds?: number[];
  dateFrom?: string;
  dateTo?: string;
  totalInWindow?: number;
  newFound?: number;
  error?: string;
  updatedAt: string;
}

export interface Appointment {
  serviceVisitID: number;
  locationName: string;
  startDateTime: string;
  trtId: number;
  activities: Array<{ symptomLabel: string; symptomKey: string; activityType: string }>;
}
