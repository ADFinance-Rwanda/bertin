import { Component, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Task Manager</h1>
        <p class="text-gray-500 mb-8">Sign in to manage your tasks</p>

        <button
          (click)="login()"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Sign in with Keycloak
        </button>

        <p class="mt-6 text-xs text-gray-400">
          Test accounts: admin&#64;example.com / admin123 &nbsp;|&nbsp; user&#64;example.com / user123
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private keycloak = inject(KeycloakService);

  login() {
    this.keycloak.login({ redirectUri: window.location.origin + '/tasks' });
  }
}
