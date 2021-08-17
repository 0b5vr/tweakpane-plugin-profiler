import { LabelController, ParamsParsers, ValueMap, parseParams } from '@tweakpane/core';
import { ProfilerBladeApi } from './ProfilerBladeApi';
import { ProfilerBladeController } from './ProfilerBladeController';
import { createTicker } from './utils/createTicker';
import type {
  BladePlugin,
  LabelPropsObject,
} from '@tweakpane/core';
import type { ProfilerBladePluginParams } from './ProfilerBladePluginParams';

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
      targetLength: p.optional.number,
      unitString: p.optional.string,
      fractionDigits: p.optional.number,
      label: p.optional.string,
      interval: p.optional.number,
    } );

    return result ? { params: result } : null;
  },

  controller( args ) {
    const interval = args.params.interval ?? 500;
    const targetLength = args.params.targetLength ?? 16.67;
    const unitString = args.params.unitString ?? 'ms';
    const fractionDigits = args.params.fractionDigits ?? 2;

    return new LabelController( args.document, {
      blade: args.blade,
      props: ValueMap.fromObject<LabelPropsObject>( {
        label: args.params.label,
      } ),
      valueController: new ProfilerBladeController( args.document, {
        ticker: createTicker( args.document, interval ),
        targetLength,
        unitString,
        fractionDigits,
        viewProps: args.viewProps,
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
