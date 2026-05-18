import { Component, signal, ChangeDetectionStrategy, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ProductService } from '../../../../core/services/product.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/interface/product.interface';
import { Collection } from '../../../../core/interface/collection.interface';

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

  selectedProduct = signal<Product | null>(null);
  displayDialog = signal(false);

  ngOnInit() {
    this.productService.getProducts().subscribe();
    this.collectionService.getActiveCollections().subscribe();
  }

  showProductDetails(product: Product) {
    // Optionally fetch full details here using getProductById, but we already have it in the list
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
