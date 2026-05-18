export interface Collection {
  _id: string;
  name: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollectionPayload {
  name: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImage?: string;
}
