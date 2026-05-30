import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, CreateTaskRequest } from '../../shared/models/task.model';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, TaskFormComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Tasks</h1>
        <button (click)="openCreate()"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6">
        <button *ngFor="let f of filters"
          (click)="setFilter(f.value)"
          [class]="activeFilter === f.value
            ? 'px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white font-medium'
            : 'px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'">
          {{ f.label }}
          <span class="ml-1 text-xs opacity-75">({{ countByStatus(f.value) }})</span>
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && filteredTasks.length === 0"
        class="text-center py-16 text-gray-500">
        <p class="text-lg">No tasks yet</p>
        <p class="text-sm mt-1">Create your first task to get started</p>
      </div>

      <!-- Task grid -->
      <div *ngIf="!loading && filteredTasks.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <app-task-card
          *ngFor="let task of filteredTasks; trackBy: trackById"
          [task]="task"
          (edit)="openEdit($event)"
          (delete)="deleteTask($event)"
          (statusChange)="updateStatus($event)"
        />
      </div>
    </div>

    <!-- Task form modal -->
    <app-task-form
      *ngIf="showForm"
      [task]="editingTask"
      (save)="saveTask($event)"
      (cancel)="closeForm()"
    />
  `,
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks: Task[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingTask: Task | null = null;
  activeFilter: TaskStatus | 'all' = 'all';

  filters = [
    { label: 'All', value: 'all' as const },
    { label: 'To Do', value: 'todo' as TaskStatus },
    { label: 'In Progress', value: 'in_progress' as TaskStatus },
    { label: 'Done', value: 'done' as TaskStatus },
  ];

  get filteredTasks(): Task[] {
    if (this.activeFilter === 'all') return this.tasks;
    return this.tasks.filter((t) => t.status === this.activeFilter);
  }

  countByStatus(filter: TaskStatus | 'all'): number {
    if (filter === 'all') return this.tasks.length;
    return this.tasks.filter((t) => t.status === filter).length;
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getAll().subscribe({
      next: (tasks) => { this.tasks = tasks; this.loading = false; },
      error: (e) => { this.error = e.message || 'Failed to load tasks'; this.loading = false; },
    });
  }

  setFilter(f: TaskStatus | 'all') {
    this.activeFilter = f;
  }

  openCreate() {
    this.editingTask = null;
    this.showForm = true;
  }

  openEdit(task: Task) {
    this.editingTask = task;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingTask = null;
  }

  saveTask(dto: CreateTaskRequest) {
    if (this.editingTask) {
      this.taskService.update(this.editingTask.id, dto).subscribe({
        next: (updated) => {
          this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
          this.closeForm();
        },
        error: (e) => { this.error = e.message || 'Failed to update task'; },
      });
    } else {
      this.taskService.create(dto).subscribe({
        next: (task) => { this.tasks = [task, ...this.tasks]; this.closeForm(); },
        error: (e) => { this.error = e.message || 'Failed to create task'; },
      });
    }
  }

  deleteTask(id: string) {
    if (!confirm('Delete this task?')) return;
    this.taskService.delete(id).subscribe({
      next: () => { this.tasks = this.tasks.filter((t) => t.id !== id); },
      error: (e) => { this.error = e.message || 'Failed to delete task'; },
    });
  }

  updateStatus(event: { id: string; status: TaskStatus }) {
    this.taskService.update(event.id, { status: event.status }).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
      },
      error: (e) => { this.error = e.message || 'Failed to update status'; },
    });
  }

  trackById(_: number, t: Task) { return t.id; }
}
