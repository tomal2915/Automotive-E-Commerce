import { useEffect, useState } from "react";

// Delays updating the returned value until the input has stopped
// changing for `delay` ms — used to avoid firing an API call on every keystroke
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel the pending update if value changes again first
  }, [value, delay]);

  return debouncedValue;
};
