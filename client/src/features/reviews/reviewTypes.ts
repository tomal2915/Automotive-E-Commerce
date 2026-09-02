export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}