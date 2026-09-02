import { useQuery } from "@tanstack/react-query";
import { fetchSearchSuggestions } from "./searchApi";
import { useDebounce } from "../../hooks/useDebounce";

export const useSearchSuggestions = (rawQuery: string) => {
  const query = useDebounce(rawQuery, 300); // wait 300ms after typing stops

  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => fetchSearchSuggestions(query),
    enabled: query.trim().length >= 2, // don't fire for very short/empty queries
    staleTime: 30_000, // cache identical searches briefly (e.g. re-typing the same term)
  });
};