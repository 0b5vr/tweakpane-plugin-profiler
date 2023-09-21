# `@0b5vr/tweakpane-plugin-profiler`

[![npm](https://img.shields.io/npm/v/@0b5vr/tweakpane-plugin-profiler?logo=npm&style=flat-square)](https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-profiler)

Profiler plugin for Tweakpane

![tweakpane-plugin-profiler](https://github.com/0b5vr/tweakpane-plugin-profiler/raw/dev/readme-images/tweakpane-plugin-profiler.png)

[Sandbox](https://0b5vr.github.io/tweakpane-plugin-profiler)

```html
<script type="module">
  import * as Tweakpane from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
  import * as TweakpaneProfilerBladePlugin from './tweakpane-plugin-profiler.js';

  const pane = new Tweakpane.Pane();

  pane.registerPlugin( TweakpaneProfilerBladePlugin );

  const profiler = pane.addBlade( {
    view: 'profiler',
    label: 'profiler',
  } );

  function update() {
    profiler.measure( 'haha', () => {
      somethingExpensive();
    } );

    requestAnimationFrame( update );
  }
  requestAnimationFrame( update );
</script>
```
