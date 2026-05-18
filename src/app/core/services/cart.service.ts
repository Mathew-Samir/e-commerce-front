import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../interface/cart.interface';
import { ApiResponse } from '../interface/api-response.interface';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { AuthService } from './auth.service';
import { tap, catchError, of, finalize } from 'rxjs';

import { Product } from '../interface/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/cart`;

  // State
  private cartSignal = signal<Cart>({ items: [], totalQuantity: 0, totalPrice: 0 });
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Selectors
  cart = computed(() => this.cartSignal());
  cartItems = computed(() => this.cartSignal().items);
  cartCount = computed(() => this.cartSignal().totalQuantity);
  totalPrice = computed(() => this.cartSignal().totalPrice);
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  constructor() {
    // Fetch cart on initialization
    this.fetchCart();

    // Automatically sync cart when authentication status changes
    effect(() => {
      if (this.authService.isAuthenticated()) {
        const guestCart = this.getGuestCart();
        if (guestCart.items.length > 0) {
          this.syncCart();
        }
      }
    });
  }

  fetchCart() {
    if (!this.authService.isAuthenticated()) {
      this.loadGuestCart();
      return;
    }

    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<any>>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSignal.set(this.mapCartResponse(res.data));
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch cart');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }

  addToCart(product: Product, quantity: number = 1) {
    // Check if adding this would exceed stock
    const cart = this.cartSignal();
    const existingItem = cart.items.find(item => item.productId === product._id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (product.stock < currentQty + quantity) {
      this.errorSignal.set(`Cannot add more. Only ${product.stock} items in stock.`);
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.addToGuestCart(product, quantity);
      return;
    }

    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<any>>(this.apiUrl, { productId: product._id, quantity }).pipe(
      tap((res) => {
        if (res.success) {
          this.fetchCart();
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to add to cart');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }

  updateQuantity(itemId: string, quantity: number) {
    if (!this.authService.isAuthenticated()) {
      this.updateGuestQuantity(itemId, quantity);
      return;
    }

    this.loadingSignal.set(true);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${itemId}`, { quantity }).pipe(
      tap((res) => {
        if (res.success) {
          this.fetchCart();
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to update quantity');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }

  removeItem(itemId: string) {
    if (!this.authService.isAuthenticated()) {
      this.removeFromGuestCart(itemId);
      return;
    }

    this.loadingSignal.set(true);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${itemId}`).pipe(
      tap((res) => {
        if (res.success) {
          this.fetchCart();
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to remove item');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }


  clearCart() {
    if (!this.authService.isAuthenticated()) {
      this.cartSignal.set({ items: [], totalQuantity: 0, totalPrice: 0 });
      this.clearGuestCart();
      return;
    }

    this.loadingSignal.set(true);
    this.http.delete<ApiResponse<any>>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSignal.set({ items: [], totalQuantity: 0, totalPrice: 0 });
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to clear cart');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }

  syncCart() {
    const guestCart = this.getGuestCart();
    if (guestCart.items.length === 0) return;

    const guestItems = guestCart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    this.loadingSignal.set(true);
    this.http.post<ApiResponse<any>>(`${this.apiUrl}/sync`, { guestItems }).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSignal.set(this.mapCartResponse(res.data));
          this.clearGuestCart();
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to sync cart');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe();
  }

  // Guest Cart Helpers (LocalStorage)
  private loadGuestCart() {
    const savedCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    if (savedCart) {
      this.cartSignal.set(JSON.parse(savedCart));
    } else {
      this.cartSignal.set({ items: [], totalQuantity: 0, totalPrice: 0 });
    }
  }

  private saveGuestCart(cart: Cart) {
    localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
    this.cartSignal.set(cart);
  }

  private getGuestCart(): Cart {
    const savedCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return savedCart ? JSON.parse(savedCart) : { items: [], totalQuantity: 0, totalPrice: 0 };
  }

  private addToGuestCart(product: Product, quantity: number) {
    const cart = this.getGuestCart();
    const existingItem = cart.items.find(i => i.productId === product._id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (product.stock < currentQty + quantity) {
       this.errorSignal.set(`Only ${product.stock} items available`);
       return;
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(7), // Temporary ID for guest items
        productId: product._id,
        product: product,
        quantity: quantity,
        price: product.price
      };
      cart.items.push(newItem);
    }

    this.recalculateCart(cart);
    this.saveGuestCart(cart);
  }

  private updateGuestQuantity(itemId: string, quantity: number) {
    const cart = this.getGuestCart();
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.recalculateCart(cart);
      this.saveGuestCart(cart);
    }
  }

  private removeFromGuestCart(itemId: string) {
    const cart = this.getGuestCart();
    cart.items = cart.items.filter(i => i.id !== itemId);
    this.recalculateCart(cart);
    this.saveGuestCart(cart);
  }

  private clearGuestCart() {
    localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
  }

  private recalculateCart(cart: Cart) {
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  private mapCartResponse(data: any): Cart {
    if (!data) {
      return { items: [], totalQuantity: 0, totalPrice: 0 };
    }

    // Handle both array response and object response formats
    const itemsArray = Array.isArray(data) ? data : (data.items || []);

    const items: CartItem[] = itemsArray.map((item: any) => ({
      id: item._id || item.id,
      productId: item.productId?._id || item.productId,
      product: item.productId?.name ? item.productId : item.product,
      quantity: item.quantity || 1,
      price: item.price || 0
    }));

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return { items, totalQuantity, totalPrice };
  }
}
