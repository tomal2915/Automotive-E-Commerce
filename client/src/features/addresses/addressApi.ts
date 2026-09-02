import { api } from "../../lib/api";

export interface Address {
  _id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  postcode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "_id" | "isDefault"> & { isDefault?: boolean };

export const fetchAddresses = async (): Promise<Address[]> => {
  const res = await api.get("/addresses");
  return res.data.addresses;
};

export const createAddressRequest = async (data: AddressInput): Promise<Address> => {
  const res = await api.post("/addresses", data);
  return res.data.address;
};

export const updateAddressRequest = async (id: string, data: Partial<AddressInput>): Promise<Address> => {
  const res = await api.put(`/addresses/${id}`, data);
  return res.data.address;
};

export const deleteAddressRequest = async (id: string) => {
  const res = await api.delete(`/addresses/${id}`);
  return res.data;
};