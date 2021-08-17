import {
  BufferedValue,
  Controller,
  Ticker,
  ViewProps,
} from '@tweakpane/core';
import { GraphLogController, createNumberFormatter, createPushedBuffer } from '@tweakpane/core';
import { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';

import { ProfilerBladeView } from './ProfilerBladeView';

// Custom controller class should implement `Controller` interface
export class ProfilerBladeController implements Controller<ProfilerBladeView> {
  public readonly view: ProfilerBladeView;
  public readonly viewProps: ViewProps;
  private readonly value_: BufferedValue<number>;
  private readonly graphC_: GraphLogController;
  private ticker_: Ticker;

  public constructor( doc: Document, config: ProfilerBladeControllerConfig ) {
    this.onTick_ = this.onTick_.bind( this );

    this.ticker_ = config.ticker;
    this.ticker_.emitter.on( 'tick', this.onTick_ );

    this.value_ = config.value;
    this.viewProps = config.viewProps;

    this.view = new ProfilerBladeView( doc, {
      viewProps: this.viewProps,
    } );

    this.graphC_ = new GraphLogController( doc, {
      formatter: createNumberFormatter( 0 ),
      lineCount: 2,
      maxValue: 1.0,
      minValue: 0.0,
      value: this.value_,
      viewProps: this.viewProps,
    } );
    this.view.graphElement.appendChild( this.graphC_.view.element );

    this.viewProps.handleDispose( () => {
      this.graphC_.viewProps.set( 'disposed', true );
      this.ticker_.dispose();
    } );
  }

  public haha(): void {
    console.info( 'haha' );
  }

  private onTick_(): void {
    const value = Math.random();
    const buffer = this.value_.rawValue;
    this.value_.rawValue = createPushedBuffer( buffer, value );
    this.view.valueElement.textContent = value.toFixed( 2 );
  }
}
