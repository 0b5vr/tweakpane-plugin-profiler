import { ClassName } from '@tweakpane/core';
import { ConsecutiveCacheMap } from './utils/ConsecutiveCacheMap';
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
  public targetDelta: number;
  public deltaUnit: string;
  public fractionDigits: number;
  public readonly element: HTMLElement;
  private readonly svgRootElement_: SVGElement;
  private readonly entryContainerElement_: SVGGElement;
  private readonly tooltipElement_: HTMLDivElement;
  private readonly tooltipInsideElement_: HTMLDivElement;
  private readonly labelElement_: HTMLDivElement;
  private readonly entryElementCacheMap_: ConsecutiveCacheMap<string, SVGGElement>;
  private hoveringEntry_: string | null;

  public constructor( doc: Document, config: ProfilerBladeViewConfig ) {
    this.targetDelta = config.targetDelta;
    this.deltaUnit = config.deltaUnit;
    this.fractionDigits = config.fractionDigits;

    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.viewProps.bindClassModifiers( this.element );

    this.svgRootElement_ = doc.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    this.svgRootElement_.classList.add( className( 'root' ) );
    this.element.appendChild( this.svgRootElement_ );

    this.entryContainerElement_ = doc.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
    this.entryContainerElement_.classList.add( className( 'container' ) );
    this.entryContainerElement_.setAttribute( 'transform', 'translate( 1, 1 )' );
    this.svgRootElement_.appendChild( this.entryContainerElement_ );

    this.tooltipElement_ = doc.createElement( 'div' );
    this.tooltipElement_.classList.add( className( 'tooltip' ) );
    this.tooltipElement_.style.display = 'none';
    this.element.appendChild( this.tooltipElement_ );

    this.tooltipInsideElement_ = doc.createElement( 'div' );
    this.tooltipInsideElement_.classList.add( className( 'tooltipinside' ) );
    this.tooltipElement_.appendChild( this.tooltipInsideElement_ );

    this.labelElement_ = doc.createElement( 'div' );
    this.labelElement_.classList.add( className( 'label' ) );
    this.labelElement_.textContent = this.deltaToDisplayDelta( 0.0 );
    this.element.appendChild( this.labelElement_ );

    this.entryElementCacheMap_ = new ConsecutiveCacheMap();

    this.hoveringEntry_ = null;
  }

  public update( rootEntry: ProfilerEntry ): void {
    this.labelElement_.textContent = this.deltaToDisplayDelta( rootEntry.deltaMedian );

    this.entryElementCacheMap_.resetUsedSet();

    const unit = 160.0 / Math.max( this.targetDelta, rootEntry.deltaMedian );
    this.addEntry_( rootEntry, this.entryContainerElement_, unit );

    this.entryElementCacheMap_.vaporize( ( [ path, element ] ) => {
      element.remove();

      if ( this.hoveringEntry_ === path ) {
        this.hoveringEntry_ = null;
      }
    } );

    this.updateTooltip_();
  }

  private updateTooltip_(): void {
    const path = this.hoveringEntry_;

    if ( path ) {
      const element = this.entryElementCacheMap_.get( path );

      const dataDelta = element?.getAttribute( 'data-delta' );
      const displayDelta = this.deltaToDisplayDelta( parseFloat( dataDelta ?? '0.0' ) );
      const text = `${ path }\n${ displayDelta }`;

      this.tooltipElement_.style.display = 'block';

      this.tooltipInsideElement_.textContent = text;
    } else {
      this.tooltipElement_.style.display = 'none';
    }
  }

  private addEntry_(
    entry: ProfilerEntry,
    parent: SVGElement,
    unit: number,
  ): SVGElement {
    const path = entry.path;

    const g = this.entryElementCacheMap_.getOrCreate( path, () => {
      const newG = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
      newG.classList.add( className( 'entry' ) );
      parent.appendChild( newG );

      this.entryElementCacheMap_.set( path, newG );

      const rect = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );
      rect.classList.add( className( 'entryrect' ) );
      newG.appendChild( rect );

      rect.addEventListener( 'mouseenter', () => {
        this.hoveringEntry_ = path;
        this.updateTooltip_();
      } );

      rect.addEventListener( 'mouseleave', () => {
        this.hoveringEntry_ = null;
        this.updateTooltip_();
      } );

      return newG;
    } );

    g.setAttribute( 'data-delta', `${ entry.deltaMedian }` );

    const rect = g.childNodes[ 0 ] as SVGRectElement;

    rect.setAttribute( 'width', `${ Math.max( 0.01, entry.deltaMedian * unit - 1.0 ) }px` );
    rect.setAttribute( 'height', `${ 9 }px` );

    const turboX = 0.15 + 0.7 * saturate( entry.deltaMedian / this.targetDelta );
    rect.setAttribute( 'fill', genTurboColormap( turboX ) );

    if ( entry.children.length > 0 ) {
      let x = 0.0;
      entry.children.forEach( ( child ) => {
        const childElement = this.addEntry_( child, g, unit );
        childElement.setAttribute( 'transform', `translate( ${ x }, ${ 10.0 } )` );
        x += child.deltaMedian * unit;
      } );
    }

    return g;
  }

  private deltaToDisplayDelta( delta: number ): string {
    return `${ delta.toFixed( this.fractionDigits ) } ${ this.deltaUnit }`;
  }
}
