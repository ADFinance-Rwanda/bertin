import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 truncate">{{ task.title }}</h3>
          <p *ngIf="task.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
            {{ task.description }}
          </p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button (click)="edit.emit(task)" title="Edit"
            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button (click)="delete.emit(task.id)" title="Delete"
            class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-3 flex-wrap">
        <span [class]="'badge-' + task.status">{{ statusLabel(task.status) }}</span>
        <span [class]="'badge-' + task.priority">{{ task.priority }}</span>
        <span *ngIf="task.due_date" class="text-xs text-gray-400">
          Due {{ task.due_date | date:'mediumDate' }}
        </span>
      </div>

      <div class="flex gap-1 mt-3">
        <button *ngFor="let s of statuses"
          (click)="statusChange.emit({ id: task.id, status: s })"
          [disabled]="task.status === s"
          [class]="task.status === s
            ? 'text-xs px-2 py-0.5 rounded border border-blue-500 text-blue-600 font-medium bg-blue-50'
            : 'text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors'"
          >{{ statusLabel(s) }}</button>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ id: string; status: TaskStatus }>();

  statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

  statusLabel(s: TaskStatus): string {
    return { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[s];
  }
}
