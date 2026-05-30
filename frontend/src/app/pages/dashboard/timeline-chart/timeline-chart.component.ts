import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { TimelineDataPoint } from '../../../shared/models/analytics.model';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-timeline-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Tasks Created (Last 30 Days)</h3>
      <div *ngIf="!hasData" class="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data available
      </div>
      <canvas #chartCanvas *ngIf="hasData" height="180"></canvas>
    </div>
  `,
})
export class TimelineChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: TimelineDataPoint[] = [];

  private chart: Chart | null = null;
  hasData = false;

  ngAfterViewInit() { this.render(); }
  ngOnChanges() { this.hasData = (this.data || []).length > 0; if (this.canvasRef) this.render(); }

  private render() {
    if (!this.canvasRef || !this.hasData) return;
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.data.map(d => d.date),
        datasets: [{ label: 'Tasks Created', data: this.data.map(d => d.count), backgroundColor: '#3b82f6', borderRadius: 4 }],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } },
    });
  }
}
