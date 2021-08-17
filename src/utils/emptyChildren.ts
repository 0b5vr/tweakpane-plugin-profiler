export function emptyChildren( element: Element ): void {
  Array.from( element.childNodes ).forEach( ( child ) => {
    element.removeChild( child );
  } );
}
