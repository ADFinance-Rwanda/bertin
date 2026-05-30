import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../../shared/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/tasks`;

  getAll(status?: TaskStatus): Observable<Task[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Task[]>(this.base, { params });
  }

  getOne(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(dto: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.base, dto);
  }

  update(id: string, dto: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
