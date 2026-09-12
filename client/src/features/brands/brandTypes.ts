export interface Brand {
  _id: string;
  name: string;
  description?: string;
  status: boolean; // true = active
  logo?: {
    _id: string;
    url: string;
  };
}
