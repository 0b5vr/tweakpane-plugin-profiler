import { ConsecutiveCacheMap } from './utils/ConsecutiveCacheMap';
import {
  Controller,
  Ticker,
  ViewProps,
} from '@tweakpane/core';
import { HistoryMeanCalculator } from './utils/HistoryMeanCalculator';
import { HistoryPercentileCalculator } from './utils/HistoryPercentileCalculator';
import { LatestPromiseHandler } from './utils/LatestPromiseHandler';
import { ProfilerBladeView } from './ProfilerBladeView';
import { arraySum } from './utils/arraySum';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerEntry } from './ProfilerEntry';
import type { ProfilerMeasureStackEntry } from './ProfilerMeasureStackEntry';

// Custom controller class should implement `Controller` interface
export class ProfilerBladeController implements Controller<ProfilerBladeView> {
  public targetDelta: number;
  public bufferSize: number;
  public measureHandler: ProfilerBladeMeasureHandler;
  public readonly view: ProfilerBladeView;
  public readonly viewProps: ViewProps;
  private ticker_: Ticker;

  private measureStack_: ProfilerMeasureStackEntry[];
  private latestEntry_: ProfilerEntry;
  private latestPromiseHandler_: LatestPromiseHandler<ProfilerEntry>;
  private readonly entryCalcCacheMap_: ConsecutiveCacheMap<string, {
    meanCalc: HistoryMeanCalculator,
    medianCalc: HistoryPercentileCalculator,
  }>;

  public constructor( doc: Document, config: ProfilerBladeControllerConfig ) {
    this.targetDelta = config.targetDelta;
    this.bufferSize = config.bufferSize;

    this.onTick_ = this.onTick_.bind( this );

    this.ticker_ = config.ticker;
    this.ticker_.emitter.on( 'tick', this.onTick_ );

    this.viewProps = config.viewProps;

    this.view = new ProfilerBladeView( doc, {
      targetDelta: this.targetDelta,
      deltaUnit: config.deltaUnit,
      fractionDigits: config.fractionDigits,
      calcMode: config.calcMode,
      viewProps: this.viewProps,
    } );

    this.viewProps.handleDispose( () => {
      this.ticker_.dispose();
    } );

    this.measureHandler = config.measureHandler;

    this.measureStack_ = [];
    this.latestEntry_ = {
      name: 'root',
      path: '/root',
      delta: 0.0,
      deltaMean: 0.0,
      deltaMedian: 0.0,
      selfDelta: 0.0,
      selfDeltaMean: 0.0,
      selfDeltaMedian: 0.0,
      children: [],
    };
    this.latestPromiseHandler_ = new LatestPromiseHandler( ( entry ) => {
      this.latestEntry_ = entry;
    } );

    this.entryCalcCacheMap_ = new ConsecutiveCacheMap();
  }

  public measure( name: string, fn: () => void ): void {
    const parent = this.measureStack_[ this.measureStack_.length - 1 ];
    const path = `${ parent?.path ?? '' }/${ name }`;

    if ( parent == null ) {
      this.entryCalcCacheMap_.resetUsedSet();
    }

    const { meanCalc, medianCalc } = this.entryCalcCacheMap_.getOrCreate( path, () => {
      return {
        meanCalc: new HistoryMeanCalculator( this.bufferSize ),
        medianCalc: new HistoryPercentileCalculator( this.bufferSize ),
      };
    } );

    const measureStackEntry: ProfilerMeasureStackEntry = {
      path,
      promiseChildren: [],
    };
    this.measureStack_.push( measureStackEntry );

    const promiseEntry = ( async (): Promise<ProfilerEntry> => {
      const delta = await Promise.resolve( this.measureHandler.measure( path, fn ) );

      const children = await Promise.all( measureStackEntry.promiseChildren );
      const sumChildrenDelta = arraySum( children.map( ( child ) => child.delta ) );
      const selfDelta = delta - sumChildrenDelta;

      meanCalc.push( selfDelta );
      medianCalc.push( selfDelta );
      const selfDeltaMean = meanCalc.mean;
      const selfDeltaMedian = medianCalc.median;

      const sumChildDeltaMean = arraySum( children.map( ( child ) => child.deltaMean ) );
      const sumChildDeltaMedian = arraySum( children.map( ( child ) => child.deltaMedian ) );
      const deltaMean = selfDeltaMean + sumChildDeltaMean;
      const deltaMedian = selfDeltaMedian + sumChildDeltaMedian;

      return {
        name,
        path,
        delta,
        deltaMean,
        deltaMedian,
        selfDelta,
        selfDeltaMean,
        selfDeltaMedian,
        children,
      };
    } )();
    parent?.promiseChildren.push( promiseEntry );

    this.measureStack_.pop();

    if ( parent == null ) {
      this.latestPromiseHandler_.add( promiseEntry );
      this.entryCalcCacheMap_.vaporize();
    }
  }

  private onTick_(): void {
    this.view.update( this.latestEntry_ );
  }
}
