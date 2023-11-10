import { ProfilerBladeApi } from './ProfilerBladeApi.js';
import { ProfilerBladeController } from './ProfilerBladeController.js';
import { ProfilerBladeDefaultMeasureHandler } from './ProfilerBladeDefaultMeasureHandler.js';
import { ProfilerController } from './ProfilerController.js';
import { ValueMap, createPlugin, parseRecord } from '@tweakpane/core';
import { createTicker } from './utils/createTicker.js';
import type { BladePlugin, LabelPropsObject } from '@tweakpane/core';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';
import type { ProfilerBladePluginParams } from './ProfilerBladePluginParams.js';

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

function parseMeasureHandler( value: unknown ): ProfilerBladeMeasureHandler | undefined {
  if ( typeof value === 'object' && value != null && 'measureStart' in value ) {
    return value as ProfilerBladeDefaultMeasureHandler;
  } else {
    if ( typeof value === 'object' && value != null && 'measure' in value ) {
      console.warn( 'The API of `ProfilerBladeDefaultMeasureHandler` has been changed in v0.4.0! Please define `measureStart` instead of `measure`. Fallback to the default measure handler.' );
    }
    return undefined;
  }
}

export const ProfilerBladePlugin: BladePlugin<ProfilerBladePluginParams> = createPlugin( {
  id: 'profiler',
  type: 'blade',

  accept( params: Record<string, unknown> ) {
    // Parse parameters object
    const result = parseRecord<ProfilerBladePluginParams>( params, ( p ) => ( {
      view: p.required.constant( 'profiler' ),
      targetDelta: p.optional.number,
      bufferSize: p.optional.number,
      deltaUnit: p.optional.string,
      fractionDigits: p.optional.number,
      calcMode: p.optional.custom( parseCalcMode ),
      label: p.optional.string,
      interval: p.optional.number,
      measureHandler: p.optional.custom( parseMeasureHandler ),
    } ) );

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

    return new ProfilerBladeController( args.document, {
      blade: args.blade,
      labelProps: ValueMap.fromObject<LabelPropsObject>( {
        label: args.params.label
      } ),
      valueController: new ProfilerController( args.document, {
        ticker: createTicker( args.document, interval ),
        targetDelta,
        bufferSize,
        deltaUnit,
        fractionDigits,
        calcMode,
        viewProps: args.viewProps,
        measureHandler,
      } )
    } );
  },

  api( args ) {
    if ( !( args.controller instanceof ProfilerBladeController ) ) {
      return null;
    }

    return new ProfilerBladeApi( args.controller );
  }
} );
