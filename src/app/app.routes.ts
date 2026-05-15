import { Routes } from '@angular/router';
import { ECommerce } from './features/e-commerce/e-commerce';
import { Signup } from './features/auth/signup/signup';
import { Login } from './features/auth/login/login';
import { ChangePassword } from './features/auth/change-password/change-password';
import { Home } from './features/e-commerce/pages/home/home';
import { ProductList } from './features/e-commerce/pages/product-list/product-list';
import { ProductDetail } from './features/e-commerce/pages/product-detail/product-detail';
import { Testimonials } from './features/e-commerce/pages/testimonials/testimonials';
import { Cart } from './features/e-commerce/pages/cart/cart';


import { adminGuard, userGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: ECommerce,
    canActivate: [userGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'product-list', component: ProductList },
      { path: 'product-detail', component: ProductDetail },
      { path: 'testimonials', component: Testimonials },
      { path: 'signup', component: Signup },
      { path: 'login', component: Login },
      { path: 'change-password', component: ChangePassword },
      { path: 'cart', component: Cart },
      {
        path: 'order',
        loadComponent: () =>
          import('./features/e-commerce/pages/your-order/your-order').then((m) => m.YourOrder),
      },
      {
        path: 'order/:id',
        loadComponent: () =>
          import('./features/e-commerce/pages/your-order/your-order').then((m) => m.YourOrder),
      },
      {
        path: 'my-orders',
        loadComponent: () =>
          import('./features/e-commerce/pages/my-orders/my-orders').then((m) => m.MyOrders),
      },
      {
        path: 'my-refunds',
        loadComponent: () =>
          import('./features/e-commerce/pages/my-refunds/my-refunds').then((m) => m.MyRefunds),
      },
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/orders/orders').then(
            (m) => m.OrdersManagement,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/reports/reports').then(
            (m) => m.SalesReports,
          ),
      },
      {
        path: 'testimonials',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/testimonials/testimonials').then(
            (m) => m.TestimonialsManagement,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/products/products').then(
            (m) => m.ProductsManagement,
          ),
      },
      {
        path: 'refunds',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/refunds/refunds').then(
            (m) => m.RefundsManagement,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin-dashboard/pages/categories/categories').then(
            (m) => m.CategoriesManagement,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
