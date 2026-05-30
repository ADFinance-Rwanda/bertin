import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CreateTaskRequest, TaskStatus, TaskPriority } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ task ? 'Edit Task' : 'New Task' }}
          </h2>
        </div>
        <form (ngSubmit)="submit()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              [(ngModel)]="form.title"
              name="title"
              required
              maxlength="255"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              [(ngModel)]="form.description"
              name="description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select [(ngModel)]="form.status" name="status"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select [(ngModel)]="form.priority" name="priority"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              [(ngModel)]="form.due_date"
              name="due_date"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="cancel.emit()"
              class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!form.title"
              class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<CreateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  form: CreateTaskRequest = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  };

  ngOnInit() {
    if (this.task) {
      this.form = {
        title: this.task.title,
        description: this.task.description ?? '',
        status: this.task.status,
        priority: this.task.priority,
        due_date: this.task.due_date
          ? this.task.due_date.split('T')[0]
          : '',
      };
    }
  }

  submit() {
    if (!this.form.title.trim()) return;
    const payload: CreateTaskRequest = {
      title: this.form.title.trim(),
      status: this.form.status,
      priority: this.form.priority,
    };
    if (this.form.description) payload.description = this.form.description;
    if (this.form.due_date) payload.due_date = new Date(this.form.due_date).toISOString();
    this.save.emit(payload);
  }
}
