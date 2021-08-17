/**
 * I don't like reduce
 */
export function arraySum( array: number[] ): number {
  let sum = 0.0;
  array.forEach( ( v ) => sum += v );
  return sum;
}
