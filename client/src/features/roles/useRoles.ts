import { useQuery } from "@tanstack/react-query";
import { fetchRoles } from "./roleApi";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
};
