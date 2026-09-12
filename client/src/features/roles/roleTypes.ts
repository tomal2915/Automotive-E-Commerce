export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[]; // e.g. ["products:view", "products:create"]
}
