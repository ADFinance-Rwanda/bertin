import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnalyticsResponse,
  StatusData,
  TimelineDataPoint,
  SummaryData,
} from '../../shared/models/analytics.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/analytics`;

  getByStatus(): Observable<AnalyticsResponse<StatusData[]>> {
    return this.http.get<AnalyticsResponse<StatusData[]>>(`${this.base}/tasks-by-status`);
  }

  getOverTime(days = 30): Observable<AnalyticsResponse<TimelineDataPoint[]>> {
    return this.http.get<AnalyticsResponse<TimelineDataPoint[]>>(
      `${this.base}/tasks-created-over-time?days=${days}`,
    );
  }

  getSummary(): Observable<AnalyticsResponse<SummaryData>> {
    return this.http.get<AnalyticsResponse<SummaryData>>(`${this.base}/summary`);
  }
}
