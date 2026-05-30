export interface StatusData {
  status: string;
  count: number;
}

export interface TimelineDataPoint {
  date: string;
  count: number;
}

export interface SummaryData {
  total: number;
  done: number;
  in_progress: number;
  todo: number;
  overdue: number;
  due_soon: number;
  completion_pct: number;
}

export interface AnalyticsResponse<T> {
  data: T;
  cached: boolean;
}
