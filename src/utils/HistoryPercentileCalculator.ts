import { binarySearch } from './binarySearch.js';

/**
 * Useful for fps calc
 */
export class HistoryPercentileCalculator {
  private __history: number[] = [];
  private __sorted: number[] = [];
  private __index = 0;
  private readonly __length: number;

  public constructor( length: number ) {
    this.__length = length;
  }

  public get median(): number {
    return this.percentile( 50.0 );
  }

  public percentile( percentile: number ): number {
    if ( this.__history.length === 0 ) { return 0.0; }
    return this.__sorted[ Math.round( percentile * 0.01 * ( this.__history.length - 1 ) ) ];
  }

  public reset(): void {
    this.__index = 0;
    this.__history = [];
    this.__sorted = [];
  }

  public push( value: number ): void {
    const prev = this.__history[ this.__index ];
    this.__history[ this.__index ] = value;
    this.__index = ( this.__index + 1 ) % this.__length;

    // remove the prev from sorted array
    if ( this.__sorted.length === this.__length ) {
      const prevIndex = binarySearch( this.__sorted, prev );
      this.__sorted.splice( prevIndex, 1 );
    }

    const index = binarySearch( this.__sorted, value );
    this.__sorted.splice( index, 0, value );
  }
}
