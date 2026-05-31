import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryData } from '../../../shared/models/analytics.model';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Productivity Summary</h3>
      <div *ngIf="!summary" class="text-gray-400 text-sm">No data</div>
      <div *ngIf="summary" class="grid grid-cols-2 gap-4">
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900">{{ summary.total }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900">{{ summary.completion_pct }}%</div>
          <div class="text-xs text-gray-500 mt-0.5">Completion Rate</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900">{{ summary.in_progress }}</div>
          <div class="text-xs text-gray-500 mt-0.5">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900 bg-green-300">{{ summary.done }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Completed</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900 bg-red-300">{{ summary.overdue }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Overdue</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-900 bg-yellow-300">{{ summary.due_soon }}</div>
          <div class="text-xs text-gray-500 mt-0.5">Due in 3 Days</div>
        </div>
      </div>

      <!-- Completion bar -->
      <div *ngIf="summary && summary.total > 0" class="mt-4">
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{{ summary.done }}/{{ summary.total }} done</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all"
            [style.width.%]="summary.completion_pct"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      @apply bg-gray-50 rounded-lg p-3;
    }
  `],
})
export class SummaryCardsComponent {
  @Input() summary: SummaryData | null = null;
}
