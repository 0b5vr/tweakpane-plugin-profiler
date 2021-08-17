import { saturate } from './saturate';

export function colorArrayToHex( array: number[] ): string {
  return '#' + array.map( ( v ) => '0' + saturate( v * 256.0 ).toString( 16 ) ).join( '' );
}
