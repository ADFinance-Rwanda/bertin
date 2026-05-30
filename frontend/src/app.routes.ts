import { Routes } from '@angular/router';
import { authGuard } from './app/core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./app/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./app/pages/tasks/tasks.component').then((m) => m.TasksComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./app/pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'tasks' },
];
