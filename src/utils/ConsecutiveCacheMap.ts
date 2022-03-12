import { arrayClear } from './arrayClear';

export class ConsecutiveOrderedCacheMap<TKey, TValue> {
  public readonly map: Map<TKey, TValue>;
  public readonly keyArray: TKey[];

  public constructor() {
    this.map = new Map();
    this.keyArray = [];
  }

  public get( key: TKey ): TValue | undefined {
    return this.map.get( key );
  }

  public getOrCreate( key: TKey, create: () => TValue ): TValue {
    this.__markAsUsed( key );
    let value = this.map.get( key );
    if ( value == null ) {
      value = create();
      this.map.set( key, value );
    }
    return value;
  }

  public set( key: TKey, value: TValue ): void {
    this.__markAsUsed( key );
    this.map.set( key, value );
  }

  public resetUsedSet(): void {
    arrayClear( this.keyArray );
  }

  public vaporize( onVaporize?: ( entry: [ key: TKey, value: TValue ] ) => void ): void {
    Array.from( this.map.entries() ).forEach( ( [ key, value ] ) => {
      if ( this.keyArray.indexOf( key ) === -1 ) {
        this.map.delete( key );
        onVaporize?.( [ key, value ] );
      }
    } );
  }

  private __markAsUsed( key: TKey ): void {
    if ( this.keyArray.indexOf( key ) === -1 ) {
      this.keyArray.push( key );
    }
  }
}
