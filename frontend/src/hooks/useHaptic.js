export function useHaptic() {
  const vibrate = (pattern = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  return { vibrate };
}
