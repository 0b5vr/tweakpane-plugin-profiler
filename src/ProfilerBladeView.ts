import { ClassName } from '@tweakpane/core';
import { genTurboColormap } from './utils/genTurboColormap';
import { saturate } from './utils/saturate';
import type { ProfilerBladeViewConfig } from './ProfilerBladeViewConfig';
import type { ProfilerEntry } from './ProfilerEntry';
import type { View } from '@tweakpane/core';

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName( 'profiler' );

// Custom view class should implement `View` interface
export class ProfilerBladeView implements View {
  public targetLength: number;
  public unitString: string;
  public fractionDigits: number;
  public readonly element: HTMLElement;
  private readonly svgRootElement_: SVGElement;
  private readonly entryContainerElement_: SVGElement;
  private readonly labelElement_: HTMLDivElement;
  private readonly entryElementCacheMap_: Map<string, SVGElement>;
  private rootLengthCache_: number;
  private hoveringEntry_: string | null;

  public constructor( doc: Document, config: ProfilerBladeViewConfig ) {
    this.targetLength = config.targetLength;
    this.unitString = config.unitString;
    this.fractionDigits = config.fractionDigits;

    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.viewProps.bindClassModifiers( this.element );

    this.svgRootElement_ = doc.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    this.svgRootElement_.classList.add( className( 'root' ) );
    this.element.appendChild( this.svgRootElement_ );

    this.entryContainerElement_ = doc.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
    this.entryContainerElement_.classList.add( className( 'container' ) );
    this.svgRootElement_.appendChild( this.entryContainerElement_ );

    this.labelElement_ = doc.createElement( 'div' );
    this.labelElement_.classList.add( className( 'label' ) );
    this.element.appendChild( this.labelElement_ );

    this.rootLengthCache_ = 0.0;
    this.entryElementCacheMap_ = new Map();

    this.hoveringEntry_ = null;
  }

  public update( rootEntry: ProfilerEntry ): void {
    this.rootLengthCache_ = rootEntry.length;

    const unit = 160.0 / Math.max( this.targetLength, rootEntry.length );
    const updatedPathSet = new Set<string>();
    this.addEntry_( rootEntry, this.entryContainerElement_, unit, updatedPathSet );

    this.removeNotUpdatedElements_( updatedPathSet );

    this.updateTooltip_();
  }

  private updateTooltip_(): void {
    const path = this.hoveringEntry_;

    if ( path ) {
      const dataLength = this.entryElementCacheMap_.get( path )?.getAttribute( 'data-length' );
      const displayLength = this.lengthToDisplayLength( parseFloat( dataLength ?? '0.0' ) );
      this.labelElement_.textContent = `${ displayLength }: ${ path }`;
    } else {
      this.labelElement_.textContent = this.lengthToDisplayLength( this.rootLengthCache_ );
    }
  }

  private addEntry_(
    entry: ProfilerEntry,
    parent: SVGElement,
    unit: number,
    updatedPathSet: Set<string>,
  ): SVGElement {
    const path = entry.path;
    updatedPathSet.add( path );

    let g = this.entryElementCacheMap_.get( path );

    if ( g == null ) {
      g = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
      g.classList.add( className( 'entry' ) );
      parent.appendChild( g );

      this.entryElementCacheMap_.set( path, g );

      const rect = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );
      rect.classList.add( className( 'entryrect' ) );
      g.appendChild( rect );

      rect.addEventListener( 'mouseenter', () => {
        this.hoveringEntry_ = path;
        this.updateTooltip_();
      } );

      rect.addEventListener( 'mouseleave', () => {
        this.hoveringEntry_ = null;
        this.updateTooltip_();
      } );
    }

    g!.setAttribute( 'data-length', `${ entry.length }` );

    const rect = g.childNodes[ 0 ] as SVGRectElement;

    rect.setAttribute( 'width', `${ Math.max( 0.0, entry.length * unit - 1.0 ) }px` );
    rect.setAttribute( 'height', `${ 9 }px` );

    const turboX = 0.15 + 0.7 * saturate( entry.length / this.targetLength );
    rect.setAttribute( 'fill', genTurboColormap( turboX ) );

    if ( entry.children.length > 0 ) {
      let x = 0.0;
      entry.children.forEach( ( child ) => {
        const childElement = this.addEntry_( child, g!, unit, updatedPathSet );
        childElement.setAttribute( 'transform', `translate( ${ x }, ${ 10.0 } )` );
        x += child.length * unit;
      } );
    }

    return g;
  }

  private lengthToDisplayLength( length: number ): string {
    return `${ length.toFixed( this.fractionDigits ) } ${ this.unitString }`;
  }

  private removeNotUpdatedElements_( updatedPathSet: Set<string> ): void {
    Array.from( this.entryElementCacheMap_.entries() ).forEach( ( [ path, element ] ) => {
      if ( !updatedPathSet.has( path ) ) {
        element.remove();
        this.entryElementCacheMap_.delete( path );

        if ( this.hoveringEntry_ === path ) {
          this.hoveringEntry_ = null;
        }
      }
    } );
  }
}
