# `@0b5vr/tweakpane-plugin-profiler`

[![npm](https://img.shields.io/npm/v/@0b5vr/tweakpane-plugin-profiler?logo=npm&style=flat-square)](https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-profiler)

Profiler plugin for Tweakpane

![profiler](https://github.com/0b5vr/tweakpane-plugin-profiler/raw/dev/readme-images/profiler.png)

[Sandbox](https://0b5vr.github.io/tweakpane-plugin-profiler)

```html
<script src="https://unpkg.com/tweakpane@3.0.5/dist/tweakpane.js"></script>
<script src="./tweakpane-plugin-profiler.js"></script>
<script>
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
