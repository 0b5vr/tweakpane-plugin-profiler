# `@0b5vr/tweakpane-plugin-profiler`

Profiler plugin for Tweakpane

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
