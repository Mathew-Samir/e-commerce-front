import { Component, signal, ChangeDetectionStrategy, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ProductService } from '../../../../core/services/product.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/interface/product.interface';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,

    IconField,
    InputIcon,
    TooltipModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private collectionService = inject(CollectionService);
  private cartService = inject(CartService);

  // Access signals from service
  products = this.productService.products;
  activeCollections = this.collectionService.activeCollections;
  isLoading = this.productService.isLoading;
  error = this.productService.error;

  searchTerm = signal('');
  selectedSort = signal<string | null>(null);
  selectedCollection = signal<string | null>(null);

  // Pagination Signals
  first = signal(0);
  rows = signal(9);

  sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' },
  ];

  filteredProducts = computed(() => {
    let filtered = this.products().filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCollection = !this.selectedCollection()
        || product.collectionId?._id === this.selectedCollection();
      return matchesSearch && matchesCollection;
    });

    if (this.selectedSort()) {
      filtered.sort((a, b) => {
        switch (this.selectedSort()) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
    }

    return filtered;
  });

  // Paginated slice computed signal
  paginatedProducts = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredProducts().slice(start, end);
  });

  selectedProduct = signal<Product | null>(null);
  displayDialog = signal(false);

  ngOnInit() {
    this.productService.getProducts().subscribe();
    this.collectionService.getActiveCollections().subscribe();
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined) {
      this.first.set(event.first);
    }
    if (event.rows !== undefined) {
      this.rows.set(event.rows);
    }
    
    // Scroll smoothly to top of products when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  onSortChange(value: string | null) {
    this.selectedSort.set(value);
    this.first.set(0);
  }

  onCollectionChange(value: string | null) {
    this.selectedCollection.set(value);
    this.first.set(0);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedSort.set(null);
    this.selectedCollection.set(null);
    this.first.set(0);
  }

  showProductDetails(product: Product) {
    this.selectedProduct.set(product);
    this.displayDialog.set(true);
  }

  getSeverity(stock: number): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  getStockStatus(stock: number): string {
    if (stock > 10) return 'INSTOCK';
    if (stock > 0) return 'LOWSTOCK';
    return 'OUTOFSTOCK';
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
