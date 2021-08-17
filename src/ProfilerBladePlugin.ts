import {
  BladePlugin,
  LabelController,
  LabelPropsObject,
  ParamsParsers,
  ValueMap,
  initializeBuffer,
  parseParams,
} from '@tweakpane/core';
import { ProfilerBladeApi } from './ProfilerBladeApi';
import { ProfilerBladeController } from './ProfilerBladeController';
import { ProfilerBladePluginParams } from './ProfilerBladePluginParams';
import { createTicker } from './utils/createTicker';

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
      label: p.optional.string,
      interval: p.optional.number,
    } );

    return result ? { params: result } : null;
  },

  controller( args ) {
    const interval = args.params.interval ?? 500;

    return new LabelController( args.document, {
      blade: args.blade,
      props: ValueMap.fromObject<LabelPropsObject>( {
        label: args.params.label,
      } ),
      valueController: new ProfilerBladeController( args.document, {
        ticker: createTicker( args.document, interval ),
        value: initializeBuffer( 10 ),
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
