import { api } from "../../lib/api";

export interface SearchSuggestion {
  _id: string;
  title: string;
  make: string;
  model: string;
  category: string;
  price: number;
  images: string[];
}

export const fetchSearchSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  const res = await api.get("/products/search/suggestions", { params: { q: query } });
  return res.data.suggestions;
};