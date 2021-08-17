import { ClassName, View } from '@tweakpane/core';
import { ProfilerBladeViewConfig } from './ProfilerBladeViewConfig';

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName( 'profiler' );

// Custom view class should implement `View` interface
export class ProfilerBladeView implements View {
  public readonly element: HTMLElement;
  public readonly graphElement: HTMLElement;
  public readonly valueElement: HTMLElement;

  public constructor( doc: Document, config: ProfilerBladeViewConfig ) {
    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.viewProps.bindClassModifiers( this.element );

    this.graphElement = doc.createElement( 'div' );
    this.graphElement.classList.add( className( 'graph' ) );
    this.element.appendChild( this.graphElement );

    const labelElement = doc.createElement( 'div' );
    labelElement.classList.add( className( 'label' ) );
    this.element.appendChild( labelElement );

    const valueElement = doc.createElement( 'span' );
    valueElement.classList.add( className( 'value' ) );
    valueElement.textContent = '--';
    labelElement.appendChild( valueElement );
    this.valueElement = valueElement;

    const unitElement = doc.createElement( 'span' );
    unitElement.classList.add( className( 'unit' ) );
    unitElement.textContent = 'FPS';
    labelElement.appendChild( unitElement );
  }
}
