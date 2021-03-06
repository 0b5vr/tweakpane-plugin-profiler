import { LabelController, ParamsParser, ParamsParsers, ValueMap, parseParams } from '@tweakpane/core';
import { ProfilerBladeApi } from './ProfilerBladeApi';
import { ProfilerBladeController } from './ProfilerBladeController';
import { ProfilerBladeDefaultMeasureHandler } from './ProfilerBladeDefaultMeasureHandler';
import { createTicker } from './utils/createTicker';
import type {
  BladePlugin,
  LabelPropsObject,
} from '@tweakpane/core';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerBladePluginParams } from './ProfilerBladePluginParams';

function parseCalcMode( value: unknown ): 'frame' | 'mean' | 'median' | undefined {
  switch ( value ) {
  case 'frame':
  case 'mean':
  case 'median':
    return value;
  default:
    return undefined;
  }
}

export const ProfilerBladePlugin: BladePlugin<
ProfilerBladePluginParams
> = {
  id: 'profiler',
  type: 'blade',
  css: '__css__',

  accept( params: Record<string, unknown> ) {
    // Parse parameters object
    const p = ParamsParsers;
    const result = parseParams<ProfilerBladePluginParams>( params, {
      view: p.required.constant( 'profiler' ),
      targetDelta: p.optional.number,
      bufferSize: p.optional.number,
      deltaUnit: p.optional.string,
      fractionDigits: p.optional.number,
      calcMode: p.optional.custom( parseCalcMode ),
      label: p.optional.string,
      interval: p.optional.number,
      measureHandler: p.optional.raw as ParamsParser<ProfilerBladeMeasureHandler>,
    } );

    return result ? { params: result } : null;
  },

  controller( args ) {
    const interval = args.params.interval ?? 500;
    const targetDelta = args.params.targetDelta ?? 16.67;
    const bufferSize = args.params.bufferSize ?? 30;
    const deltaUnit = args.params.deltaUnit ?? 'ms';
    const fractionDigits = args.params.fractionDigits ?? 2;
    const calcMode = args.params.calcMode ?? 'mean';
    const measureHandler = args.params.measureHandler ?? new ProfilerBladeDefaultMeasureHandler();

    return new LabelController( args.document, {
      blade: args.blade,
      props: ValueMap.fromObject<LabelPropsObject>( {
        label: args.params.label,
      } ),
      valueController: new ProfilerBladeController( args.document, {
        ticker: createTicker( args.document, interval ),
        targetDelta,
        bufferSize,
        deltaUnit,
        fractionDigits,
        calcMode,
        viewProps: args.viewProps,
        measureHandler,
      } ),
    } );
  },

  api( args ) {
    if ( !( args.controller instanceof LabelController ) ) {
      return null;
    }
    if ( !( args.controller.valueController instanceof ProfilerBladeController ) ) {
      return null;
    }
    return new ProfilerBladeApi( args.controller );
  }
};
