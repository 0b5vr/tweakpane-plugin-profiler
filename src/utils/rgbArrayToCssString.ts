import { saturate } from './saturate.js';

export function rgbArrayToCssString( array: number[] ): string {
  const arrayPrepared = array.map( ( v ) => saturate( v ) * 256.0 );
  return `rgb( ${ arrayPrepared.join( ', ' ) } )`;
}
