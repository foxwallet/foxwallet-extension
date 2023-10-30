export function shuffle<T>(src: T[]): T[] {
  const arr = [...src];
  let n = arr.length;
  let random: number;
  while (n !== 0) {
    random = (Math.random() * n--) >>> 0;
    [arr[n], arr[random]] = [arr[random], arr[n]];
  }
  return arr;
}
