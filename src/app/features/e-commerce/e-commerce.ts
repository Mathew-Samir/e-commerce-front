import { Component, inject, computed } from '@angular/core';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-e-commerce',
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './e-commerce.html',
  styleUrl: './e-commerce.scss',
})
export class ECommerce {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  hideLayout = computed(() => {
    const url = this.currentUrl();
    return url.includes('/login') || url.includes('/signup') || url.includes('/change-password');
  });
}
