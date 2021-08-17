import { ConsecutiveCacheMap } from './utils/ConsecutiveCacheMap';
import {
  Controller,
  Ticker,
  ViewProps,
} from '@tweakpane/core';
import { HistoryPercentileCalculator } from './utils/HistoryPercentileCalculator';
import { LatestPromiseHandler } from './utils/LatestPromiseHandler';
import { ProfilerBladeView } from './ProfilerBladeView';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerEntry } from './ProfilerEntry';

// Custom controller class should implement `Controller` interface
export class ProfilerBladeController implements Controller<ProfilerBladeView> {
  public targetDelta: number;
  public medianBufferSize: number;
  public measureHandler: ProfilerBladeMeasureHandler;
  public readonly view: ProfilerBladeView;
  public readonly viewProps: ViewProps;
  private ticker_: Ticker;

  private entryStack_: ProfilerEntry[];
  private pendings_: Promise<any>[];
  private latestEntry_: ProfilerEntry;
  private latestPromiseHandler_: LatestPromiseHandler<ProfilerEntry>;
  private readonly entryCalcCacheMap_: ConsecutiveCacheMap<string, HistoryPercentileCalculator>;

  public constructor( doc: Document, config: ProfilerBladeControllerConfig ) {
    this.targetDelta = config.targetDelta;
    this.medianBufferSize = config.medianBufferSize;

    this.onTick_ = this.onTick_.bind( this );

    this.ticker_ = config.ticker;
    this.ticker_.emitter.on( 'tick', this.onTick_ );

    this.viewProps = config.viewProps;

    this.view = new ProfilerBladeView( doc, {
      targetDelta: this.targetDelta,
      deltaUnit: config.deltaUnit,
      fractionDigits: config.fractionDigits,
      viewProps: this.viewProps,
    } );

    this.viewProps.handleDispose( () => {
      this.ticker_.dispose();
    } );

    this.measureHandler = config.measureHandler;

    this.entryStack_ = [];
    this.pendings_ = [];
    this.latestEntry_ = {
      name: 'root',
      path: '/root',
      delta: 0.0,
      children: [],
    };
    this.latestPromiseHandler_ = new LatestPromiseHandler( ( entry ) => {
      this.latestEntry_ = entry;
    } );

    this.entryCalcCacheMap_ = new ConsecutiveCacheMap();
  }

  public measure( name: string, fn: () => void ): void {
    const parent = this.entryStack_[ this.entryStack_.length - 1 ];
    const path = `${ parent?.path ?? '' }/${ name }`;

    if ( parent == null ) {
      this.pendings_ = [];
      this.entryCalcCacheMap_.resetUsedSet();
    }

    const calc = this.entryCalcCacheMap_.getOrCreate( path, () => {
      return new HistoryPercentileCalculator( this.medianBufferSize );
    } );

    const entry: ProfilerEntry = {
      name,
      path,
      delta: 0.0,
      children: [],
    };

    if ( parent != null ) {
      this.entryStack_[ this.entryStack_.length - 1 ].children.push( entry );
    }

    this.entryStack_.push( entry );

    const promiseDelta = Promise.resolve( this.measureHandler.measure( path, fn ) );
    const promiseMedian = promiseDelta.then( ( delta ) => {
      calc.push( delta );
      entry.delta = calc.median;
    } );
    this.pendings_.push( promiseMedian );

    this.entryStack_.pop();

    if ( parent == null ) {
      const promise = Promise.all( this.pendings_ ).then( () => entry );
      this.latestPromiseHandler_.add( promise );
      this.entryCalcCacheMap_.vaporize();
    }
  }

  private onTick_(): void {
    this.view.update( this.latestEntry_ );
  }
}
