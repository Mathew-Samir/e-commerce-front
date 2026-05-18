import { Component, signal, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  private authService = inject(AuthService);

  sidebarVisible = signal<boolean>(true);
  currentUser = this.authService.currentUser;

  userInitials = computed(() => {
    const name = this.currentUser()?.['name'] || 'Admin User';
    const names = name.split(' ').filter((n: string) => n.length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  menuItems = [
    { label: 'Sales Reports', icon: 'pi pi-chart-bar', route: 'reports' },
    { label: 'Orders', icon: 'pi pi-shopping-cart', route: 'orders' },
    { label: 'Products', icon: 'pi pi-box', route: 'products' },
    { label: 'Categories', icon: 'pi pi-tags', route: 'categories' },
    { label: 'Collections', icon: 'pi pi-calendar', route: 'collections' },
    { label: 'Testimonials', icon: 'pi pi-comments', route: 'testimonials' },
    { label: 'Refunds', icon: 'pi pi-receipt', route: 'refunds' },
    { label: 'Back to Site', icon: 'pi pi-arrow-left', route: '/home' },
  ];

  logout() {
    this.authService.logout().subscribe();
  }
}
