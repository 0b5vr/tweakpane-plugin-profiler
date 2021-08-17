export function dot( a: number[], b: number[] ): number {
  let sum = 0.0;

  for ( let i = 0; i < a.length; i ++ ) {
    sum += a[ i ] * b[ i ];
  }

  return sum;
}
