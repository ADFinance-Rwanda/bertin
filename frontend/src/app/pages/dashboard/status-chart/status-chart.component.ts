import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ArcElement, PieController, Tooltip, Legend } from 'chart.js';
import { StatusData } from '../../../shared/models/analytics.model';

Chart.register(ArcElement, PieController, Tooltip, Legend);

@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Tasks by Status</h3>
      <div *ngIf="!hasData" class="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data available
      </div>
      <canvas #chartCanvas *ngIf="hasData" height="220"></canvas>
    </div>
  `,
})
export class StatusChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: StatusData[] = [];

  private chart: Chart | null = null;
  hasData = false;

  ngAfterViewInit() { this.render(); }
  ngOnChanges() { this.hasData = (this.data || []).some(d => d.count > 0); if (this.canvasRef) this.render(); }

  private render() {
    if (!this.canvasRef || !this.hasData) return;
    this.chart?.destroy();
    const labels = this.data.map(d => ({ todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[d.status] ?? d.status));
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: this.data.map(d => d.count), backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e'] }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  }
}
