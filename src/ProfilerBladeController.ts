import { ConsecutiveCacheMap } from './utils/ConsecutiveCacheMap';
import {
  Controller,
  Ticker,
  ViewProps,
} from '@tweakpane/core';
import { HistoryMeanCalculator } from './utils/HistoryMeanCalculator';
import { HistoryPercentileCalculator } from './utils/HistoryPercentileCalculator';
import { ProfilerBladeView } from './ProfilerBladeView';
import { arrayClear } from './utils/arrayClear';
import { arraySum } from './utils/arraySum';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerEntry } from './ProfilerEntry';

interface CalcCache {
  meanCalc: HistoryMeanCalculator;
  medianCalc: HistoryPercentileCalculator;
  latest: number;
  childrenCacheMap: ConsecutiveCacheMap<string, CalcCache>;
  childrenPromiseDelta: Promise<number>[];
}

// Custom controller class should implement `Controller` interface
export class ProfilerBladeController implements Controller<ProfilerBladeView> {
  public targetDelta: number;
  public bufferSize: number;
  public measureHandler: ProfilerBladeMeasureHandler;
  public readonly view: ProfilerBladeView;
  public readonly viewProps: ViewProps;
  private ticker_: Ticker;

  private rootCalcCacheStack_: CalcCache[];

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

    this.rootCalcCacheStack_ = [ this.createNewEntryCalcCache_() ];
  }

  public async measure( name: string, fn: () => void ): Promise<void> {
    const parent = this.rootCalcCacheStack_[ this.rootCalcCacheStack_.length - 1 ];
    const calcCache = parent.childrenCacheMap.getOrCreate(
      name,
      () => this.createNewEntryCalcCache_(),
    );
    calcCache.childrenCacheMap.resetUsedSet();
    arrayClear( calcCache.childrenPromiseDelta );
    this.rootCalcCacheStack_.push( calcCache );

    const promiseDelta = Promise.resolve( this.measureHandler.measure( fn ) );
    parent.childrenPromiseDelta.push( promiseDelta );

    this.rootCalcCacheStack_.pop();
    calcCache.childrenCacheMap.vaporize();

    const children = await Promise.all( calcCache.childrenPromiseDelta );
    const sumChildrenDelta = arraySum( children );
    const selfDelta = ( await promiseDelta ) - sumChildrenDelta;

    calcCache.meanCalc.push( selfDelta );
    calcCache.medianCalc.push( selfDelta );
    calcCache.latest = selfDelta;
  }

  public renderEntry(): ProfilerEntry {
    return this.renderEntryFromCalcCache_( '', this.rootCalcCacheStack_[ 0 ] );
  }

  private renderEntryFromCalcCache_( name: string, calcCache: CalcCache ): ProfilerEntry {
    const children: ProfilerEntry[] = [];
    for ( const childName of calcCache.childrenCacheMap.keySet ) {
      const child = calcCache.childrenCacheMap.get( childName )!;
      children.push( this.renderEntryFromCalcCache_( childName, child ) );
    }

    const selfDelta = calcCache.latest;
    const selfDeltaMean = calcCache.meanCalc.mean;
    const selfDeltaMedian = calcCache.medianCalc.median;

    const childrenDeltaSum = arraySum( children.map( ( child ) => child.delta ) );
    const childrenDeltaMeanSum = arraySum( children.map( ( child ) => child.deltaMean ) );
    const childrenDeltaMedianSum = arraySum( children.map( ( child ) => child.deltaMedian ) );

    const delta = selfDelta + childrenDeltaSum;
    const deltaMean = selfDeltaMean + childrenDeltaMeanSum;
    const deltaMedian = selfDeltaMedian + childrenDeltaMedianSum;

    return {
      name,
      delta,
      deltaMean,
      deltaMedian,
      selfDelta,
      selfDeltaMean,
      selfDeltaMedian,
      children,
    };
  }

  private onTick_(): void {
    this.view.update( this.renderEntry() );
  }

  private createNewEntryCalcCache_(): CalcCache {
    return {
      meanCalc: new HistoryMeanCalculator( this.bufferSize ),
      medianCalc: new HistoryPercentileCalculator( this.bufferSize ),
      latest: 0.0,
      childrenCacheMap: new ConsecutiveCacheMap(),
      childrenPromiseDelta: [],
    };
  }
}
