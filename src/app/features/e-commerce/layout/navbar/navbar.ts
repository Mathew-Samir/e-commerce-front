import { Component, OnInit, computed, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, ButtonModule, BadgeModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  cartCount = this.cartService.cartCount;
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

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

    if (this.isAuthenticated()) {
      baseItems.push(
        {
          label: 'My Orders',
          icon: 'pi pi-shopping-bag',
          routerLink: '/my-orders'
        },
        {
          label: 'My Refunds',
          icon: 'pi pi-refresh',
          routerLink: '/my-refunds'
        }
      );
    }

    return baseItems;
  });

  ngOnInit() {}

  logout() {
    this.authService.logout().subscribe();
  }
}
