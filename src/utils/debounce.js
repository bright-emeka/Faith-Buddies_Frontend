// Simple debounce helper for React usage.
// Usage: const debouncedFn = useMemo(() => debounce(fn, 300), [fn]);
export default function debounce(fn, delay = 300) {
  let timerId;
  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

