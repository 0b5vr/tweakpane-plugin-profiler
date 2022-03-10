export class ConsecutiveCacheMap<TKey, TValue> {
  private __setShouldDelete: Set<TKey>;
  private readonly __map: Map<TKey, TValue>;

  public constructor() {
    this.__map = new Map();
    this.__setShouldDelete = new Set();
  }

  public get( key: TKey ): TValue | undefined {
    this.__setShouldDelete.delete( key );
    return this.__map.get( key );
  }

  public getOrCreate( key: TKey, create: () => TValue ): TValue {
    this.__setShouldDelete.delete( key );
    let value = this.__map.get( key );
    if ( value == null ) {
      value = create();
      this.__map.set( key, value );
    }
    return value;
  }

  public set( key: TKey, value: TValue ): void {
    this.__setShouldDelete.delete( key );
    this.__map.set( key, value );
  }

  public resetUsedSet(): void {
    this.__setShouldDelete = new Set( this.__map.keys() );
  }

  public vaporize( onVaporize?: ( entry: [ key: TKey, value: TValue ] ) => void ): void {
    Array.from( this.__map.entries() ).forEach( ( [ key, value ] ) => {
      if ( this.__setShouldDelete.has( key ) ) {
        this.__map.delete( key );
        onVaporize?.( [ key, value ] );
      }
    } );
  }
}
