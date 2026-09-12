import { api } from "../../lib/api";

export interface AttributeValue {
  _id: string;
  value: string;
  slug: string;
  referenceValue: string;
}

export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  type: "dropdown" | "radio" | "checkbox" | "color" | "image";
  values: AttributeValue[];
}

export const fetchAttributes = async (): Promise<Attribute[]> => {
  const res = await api.get("/attributes");
  return res.data.attributes;
};

export const createAttributeRequest = async (data: {
  name: string;
  type: string;
}): Promise<Attribute> => {
  const res = await api.post("/attributes", data);
  return res.data.attribute;
};

export const updateAttributeRequest = async (
  id: string,
  data: { name?: string; type?: string },
): Promise<Attribute> => {
  const res = await api.put(`/attributes/${id}`, data);
  return res.data.attribute;
};

export const deleteAttributeRequest = async (id: string) => {
  const res = await api.delete(`/attributes/${id}`);
  return res.data;
};

export const addAttributeValueRequest = async (
  attributeId: string,
  data: { value: string; referenceValue?: string },
): Promise<Attribute> => {
  const res = await api.post(`/attributes/${attributeId}/values`, data);
  return res.data.attribute;
};

export const removeAttributeValueRequest = async (
  attributeId: string,
  valueId: string,
) => {
  const res = await api.delete(`/attributes/${attributeId}/values/${valueId}`);
  return res.data;
};
