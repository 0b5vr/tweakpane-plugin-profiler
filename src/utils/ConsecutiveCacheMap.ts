export class ConsecutiveCacheMap<TKey, TValue> {
  private readonly __map: Map<TKey, TValue>;
  private readonly __setUsed: Set<TKey>;

  public constructor() {
    this.__map = new Map();
    this.__setUsed = new Set();
  }

  public get( key: TKey ): TValue | undefined {
    this.__setUsed.add( key );
    return this.__map.get( key );
  }

  public getOrCreate( key: TKey, create: () => TValue ): TValue {
    this.__setUsed.add( key );

    let value = this.__map.get( key );
    if ( value == null ) {
      value = create();
      this.__map.set( key, value );
    }
    return value;
  }

  public set( key: TKey, value: TValue ): void {
    this.__setUsed.add( key );
    this.__map.set( key, value );
  }

  public resetUsedSet(): void {
    this.__setUsed.clear();
  }

  public vaporize( onVaporize?: ( entry: [ key: TKey, value: TValue ] ) => void ): void {
    Array.from( this.__map.entries() ).forEach( ( [ key, value ] ) => {
      if ( !this.__setUsed.has( key ) ) {
        this.__map.delete( key );
        onVaporize?.( [ key, value ] );
      }
    } );
  }
}
