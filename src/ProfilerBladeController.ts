import { BladeController, LabelController, LabelView } from '@tweakpane/core';
import { ProfilerController } from './ProfilerController.js';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfigs.js';

export class ProfilerBladeController extends BladeController<LabelView> {
  public readonly labelController: LabelController<ProfilerController>;
  public readonly valueController: ProfilerController;

  public constructor( doc: Document, config: ProfilerBladeControllerConfig ) {
    const bc = config.valueController;
    const lc = new LabelController( doc, {
      blade: config.blade,
      props: config.labelProps,
      valueController: bc,
    } );

    super( {
      blade: config.blade,
      view: lc.view,
      viewProps: bc.viewProps,
    } );

    this.valueController = bc;
    this.labelController = lc;
  }
}
