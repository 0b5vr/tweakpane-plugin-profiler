export class ConsecutiveCacheMap<TKey, TValue> {
  public readonly map: Map<TKey, TValue>;
  public readonly keySet: Set<TKey>;

  public constructor() {
    this.map = new Map();
    this.keySet = new Set();
  }

  public get( key: TKey ): TValue | undefined {
    return this.map.get( key );
  }

  public getOrCreate( key: TKey, create: () => TValue ): TValue {
    if ( !this.keySet.has( key ) ) {
      this.keySet.add( key );
    }

    let value = this.map.get( key );
    if ( value == null ) {
      value = create();
      this.map.set( key, value );
    }
    return value;
  }

  public set( key: TKey, value: TValue ): void {
    if ( !this.keySet.has( key ) ) {
      this.keySet.add( key );
    }

    this.map.set( key, value );
  }

  public resetUsedSet(): void {
    this.keySet.clear();
  }

  public vaporize( onVaporize?: ( entry: [ key: TKey, value: TValue ] ) => void ): void {
    for ( const [ key, value ] of this.map.entries() ) {
      if ( !this.keySet.has( key ) ) {
        this.map.delete( key );
        onVaporize?.( [ key, value ] );
      }
    }
  }
}
