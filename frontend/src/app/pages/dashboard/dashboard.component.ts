import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { StatusData, TimelineDataPoint, SummaryData } from '../../shared/models/analytics.model';
import { StatusChartComponent } from './status-chart/status-chart.component';
import { TimelineChartComponent } from './timeline-chart/timeline-chart.component';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatusChartComponent,
    TimelineChartComponent,
    SummaryCardsComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span *ngIf="cachedLabel" class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            {{ cachedLabel }}
          </span>
          <button (click)="loadData()" class="text-blue-500 hover:underline">Refresh</button>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Charts grid -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-summary-cards [summary]="summary" />
        <app-status-chart [data]="statusData" />
        <app-timeline-chart [data]="timelineData" />
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  statusData: StatusData[] = [];
  timelineData: TimelineDataPoint[] = [];
  summary: SummaryData | null = null;
  loading = false;
  error = '';
  cachedLabel = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
    this.cachedLabel = '';

    forkJoin({
      status: this.analyticsService.getByStatus(),
      timeline: this.analyticsService.getOverTime(),
      summary: this.analyticsService.getSummary(),
    }).subscribe({
      next: ({ status, timeline, summary }) => {
        this.statusData = status.data;
        this.timelineData = timeline.data;
        this.summary = summary.data;

        const allCached = status.cached && timeline.cached && summary.cached;
        const someCached = status.cached || timeline.cached || summary.cached;
        this.cachedLabel = allCached
          ? 'All data from cache'
          : someCached
          ? 'Partial cache hit'
          : '';

        this.loading = false;
      },
      error: (e) => {
        this.error = e.message || 'Failed to load analytics';
        this.loading = false;
      },
    });
  }
}
