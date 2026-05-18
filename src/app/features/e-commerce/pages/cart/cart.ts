import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { NgClass, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../../core/interface/product.interface';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [
    ButtonModule,
    DataViewModule,
    TagModule,
    NgClass,
    CurrencyPipe,
    InputTextModule,
    InputTextModule,
    RouterModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isAuthenticated = this.authService.isAuthenticated;
  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;
  totalItems = this.cartService.cartCount;

  isPlacingOrder = signal(false);
  isCheckoutDialogVisible = signal(false);

  checkoutForm: FormGroup = this.fb.group({
    address: ['', Validators.required],
    phoneNumber: ['', Validators.required],
  });

  ngOnInit() {
    this.cartService.fetchCart();
  }

  updateQuantity(itemId: string, delta: number) {
    const item = this.cartItems().find((i) => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + delta;
      
      // Stock check
      if (delta > 0 && newQuantity > item.product.stock) {
        return;
      }
      
      if (newQuantity > 0) {
        this.cartService.updateQuantity(itemId, newQuantity);
      } else {
        this.removeItem(itemId);
      }
    }
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  openCheckout() {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.isCheckoutDialogVisible.set(true);
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isPlacingOrder.set(true);
    const formValue = this.checkoutForm.value;

    const orderData = {
      address: formValue.address,
      phoneNumber: formValue.phoneNumber,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        if (res.success) {
          // Clear cart and navigate to success page
          this.cartService.clearCart();
          this.isCheckoutDialogVisible.set(false);
          this.checkoutForm.reset();
          this.router.navigate(['/order', res.data._id]);
        }
        this.isPlacingOrder.set(false);
      },
      error: () => {
        this.isPlacingOrder.set(false);
      },
    });
  }

  getSeverity(
    product: Product,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'info';
    }
  }
}
