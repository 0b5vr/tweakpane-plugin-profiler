export class LatestPromiseHandler<T> {
  public handler: ( value: T ) => void;
  private id_: number;
  private latestResolved_: number;

  public constructor( handler: ( value: T ) => void ) {
    this.handler = handler;

    this.id_ = 0;
    this.latestResolved_ = -1;
  }

  public add( promise: Promise<T> ): void {
    const id = this.id_;
    this.id_ ++;

    promise.then( ( value ) => {
      if ( id > this.latestResolved_ ) {
        this.handler( value );
        this.latestResolved_ = id;
      }
    } );
  }
}
