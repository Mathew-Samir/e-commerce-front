export interface ProductCategory {
  _id: string;
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductSubCategory {
  _id: string;
  title: string;
  categoryId: ProductCategory | string;
  isActive?: boolean;
}

export interface ProductCollection {
  _id: string;
  name: string;
  title: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  categoryId?: ProductCategory;
  subCategoryId?: ProductSubCategory;
  collectionId?: ProductCollection;
  inventoryStatus?: string;
  rating?: number;
  isActive?: boolean;
}
