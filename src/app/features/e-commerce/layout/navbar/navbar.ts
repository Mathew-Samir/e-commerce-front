import { Component, OnInit, computed, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, ButtonModule, BadgeModule, RouterLink, MenuModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  readonly logoSrc = signal('assets/logo.png');
  cartCount = this.cartService.cartCount;
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  @ViewChild('menu') menu!: Menu;

  profileItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];

    if (this.currentUser()?.['role'] === 'admin') {
      items.push({
        label: 'Admin Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: '/admin'
      });
      items.push({
        separator: true
      });
    }

    items.push(
      {
        label: 'My Orders',
        icon: 'pi pi-shopping-bag',
        routerLink: '/my-orders'
      },
      {
        label: 'My Refunds',
        icon: 'pi pi-refresh',
        routerLink: '/my-refunds'
      },
      {
        label: 'Change Password',
        icon: 'pi pi-key',
        routerLink: '/change-password'
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    );

    return items;
  });

  items = computed<MenuItem[]>(() => {
    const baseItems: MenuItem[] = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home'
      },
      {
        label: 'Products',
        icon: 'pi pi-search',
        routerLink: '/product-list'
      },
      {
        label: 'Testimonials',
        icon: 'pi pi-star',
        routerLink: '/testimonials',
      },
    ];

    return baseItems;
  });

  ngOnInit() {}

  logout() {
    this.authService.logout().subscribe();
  }
}
