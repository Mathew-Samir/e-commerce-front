export interface Order {
  _id: string;
  userId: string;
  products: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'shipped' | 'received' | 'cancelledByUser' | 'cancelledByAdmin' | 'rejected' | 'refunded';
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
