import { ConsecutiveCacheMap } from './utils/ConsecutiveCacheMap.js';
import { Controller, Ticker, ViewProps } from '@tweakpane/core';
import { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';
import { arrayClear } from './utils/arrayClear.js';
import { arraySum } from './utils/arraySum.js';

import type { ProfilerEntry } from './ProfilerEntry.js';

import { HistoryMeanCalculator } from './utils/HistoryMeanCalculator.js';
import { HistoryPercentileCalculator } from './utils/HistoryPercentileCalculator.js';
import { ProfilerControllerConfig } from './ProfilerControllerConfig.js';
import { ProfilerView } from './ProfilerView.js';


interface CalcCache {
  meanCalc: HistoryMeanCalculator;
  medianCalc: HistoryPercentileCalculator;
  latest: number;
  measureEnd: ( () => number | Promise<number> ) | null;
  childrenCacheMap: ConsecutiveCacheMap<string, CalcCache>;
  childrenPromiseDelta: Promise<number>[];
}


export class ProfilerController implements Controller<ProfilerView> {
  public targetDelta: number;
  public bufferSize: number;

  public measureHandler: ProfilerBladeMeasureHandler;
  public readonly view: ProfilerView;
  public readonly viewProps: ViewProps;
  private ticker_: Ticker;

  private rootCalcCacheStack_: CalcCache[];

  public constructor( doc: Document, config: ProfilerControllerConfig ) {
    this.targetDelta = config.targetDelta;
    this.bufferSize = config.bufferSize;

    this.onTick_ = this.onTick_.bind( this );

    this.ticker_ = config.ticker;
    this.ticker_.emitter.on( 'tick', this.onTick_ );

    this.viewProps = config.viewProps;

    this.view = new ProfilerView( doc, {
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

  public measureStart( name: string ): void {
    const parentCalcCache = this.rootCalcCacheStack_[ this.rootCalcCacheStack_.length - 1 ];
    const calcCache = parentCalcCache.childrenCacheMap.getOrCreate(
      name,
      () => this.createNewEntryCalcCache_(),
    );
    calcCache.childrenCacheMap.resetUsedSet();
    arrayClear( calcCache.childrenPromiseDelta );
    this.rootCalcCacheStack_.push( calcCache );

    calcCache.measureEnd = this.measureHandler.measureStart();
  }

  public async measureEnd(): Promise<void> {
    const calcCache = this.rootCalcCacheStack_[ this.rootCalcCacheStack_.length - 1 ];
    const parentCalcCache = this.rootCalcCacheStack_[ this.rootCalcCacheStack_.length - 2 ];

    const promiseDelta = Promise.resolve( calcCache.measureEnd!() );
    calcCache.measureEnd = null;
    parentCalcCache.childrenPromiseDelta.push( promiseDelta );

    this.rootCalcCacheStack_.pop();
    calcCache.childrenCacheMap.vaporize();

    const children = await Promise.all( calcCache.childrenPromiseDelta );
    const sumChildrenDelta = arraySum( children );
    const selfDelta = ( await promiseDelta ) - sumChildrenDelta;

    calcCache.meanCalc.push( selfDelta );
    calcCache.medianCalc.push( selfDelta );
    calcCache.latest = selfDelta;
  }

  public measure( name: string, fn: () => void ): void {
    this.measureStart( name );
    fn();
    this.measureEnd();
  }

  public async measureAsync( name: string, fn: () => Promise<void> ): Promise<void> {
    this.measureStart( name );
    await fn();
    this.measureEnd();
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
      measureEnd: null,
      childrenCacheMap: new ConsecutiveCacheMap(),
      childrenPromiseDelta: [],
    };
  }
}

