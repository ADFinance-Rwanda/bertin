import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-6">
            <span class="font-bold text-blue-600 text-lg">TaskManager</span>
            <a
              routerLink="/tasks"
              routerLinkActive="text-blue-600 font-medium"
              class="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >Tasks</a>
            <a
              routerLink="/dashboard"
              routerLinkActive="text-blue-600 font-medium"
              class="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >Dashboard</a>
          </div>
          <div class="flex items-center gap-3">
            <span *ngIf="userEmail" class="text-sm text-gray-600">{{ userEmail }}</span>
            <button
              *ngIf="isLoggedIn"
              (click)="logout()"
              class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
            >Logout</button>
            <button
              *ngIf="!isLoggedIn"
              (click)="login()"
              class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
            >Login</button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit {
  private keycloak = inject(KeycloakService);
  isLoggedIn = false;
  userEmail = '';

  async ngOnInit() {
    this.isLoggedIn = await this.keycloak.isLoggedIn();
    if (this.isLoggedIn) {
      try {
        const profile = await this.keycloak.loadUserProfile();
        this.userEmail = profile.email ?? profile.username ?? '';
      } catch {
        // profile load is best-effort
      }
    }
  }

  login() {
    this.keycloak.login({ redirectUri: window.location.origin + '/tasks' });
  }

  logout() {
    this.keycloak.logout(window.location.origin + '/login');
  }
}
