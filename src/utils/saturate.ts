export function saturate( x: number ): number {
  return Math.min( Math.max( x, 0.0 ), 1.0 );
}
