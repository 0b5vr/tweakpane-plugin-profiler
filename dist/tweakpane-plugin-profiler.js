(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TweakpaneProfilerBladePlugin = {}));
}(this, (function (exports) { 'use strict';

    class ProfilerBladeDefaultMeasureHandler {
        measure(name, fn) {
            const begin = performance.now();
            fn();
            const delta = performance.now() - begin;
            return delta;
        }
    }

    class BladeApi {
        constructor(controller) {
            this.controller_ = controller;
        }
        get disabled() {
            return this.controller_.viewProps.get('disabled');
        }
        set disabled(disabled) {
            this.controller_.viewProps.set('disabled', disabled);
        }
        get hidden() {
            return this.controller_.viewProps.get('hidden');
        }
        set hidden(hidden) {
            this.controller_.viewProps.set('hidden', hidden);
        }
        dispose() {
            this.controller_.viewProps.set('disposed', true);
        }
    }

    function forceCast(v) {
        return v;
    }
    function isEmpty(value) {
        return value === null || value === undefined;
    }

    class Emitter {
        constructor() {
            this.observers_ = {};
        }
        on(eventName, handler) {
            let observers = this.observers_[eventName];
            if (!observers) {
                observers = this.observers_[eventName] = [];
            }
            observers.push({
                handler: handler,
            });
            return this;
        }
        off(eventName, handler) {
            const observers = this.observers_[eventName];
            if (observers) {
                this.observers_[eventName] = observers.filter((observer) => {
                    return observer.handler !== handler;
                });
            }
            return this;
        }
        emit(eventName, event) {
            const observers = this.observers_[eventName];
            if (!observers) {
                return;
            }
            observers.forEach((observer) => {
                observer.handler(event);
            });
        }
    }

    const PREFIX = 'tp';
    function ClassName(viewName) {
        const fn = (opt_elementName, opt_modifier) => {
            return [
                PREFIX,
                '-',
                viewName,
                'v',
                opt_elementName ? `_${opt_elementName}` : '',
                opt_modifier ? `-${opt_modifier}` : '',
            ].join('');
        };
        return fn;
    }

    function compose(h1, h2) {
        return (input) => h2(h1(input));
    }
    function extractValue(ev) {
        return ev.rawValue;
    }
    function bindValue(value, applyValue) {
        value.emitter.on('change', compose(extractValue, applyValue));
        applyValue(value.rawValue);
    }
    function bindValueMap(valueMap, key, applyValue) {
        bindValue(valueMap.value(key), applyValue);
    }

    class BoundValue {
        constructor(initialValue, config) {
            var _a;
            this.constraint_ = config === null || config === void 0 ? void 0 : config.constraint;
            this.equals_ = (_a = config === null || config === void 0 ? void 0 : config.equals) !== null && _a !== void 0 ? _a : ((v1, v2) => v1 === v2);
            this.emitter = new Emitter();
            this.rawValue_ = initialValue;
        }
        get constraint() {
            return this.constraint_;
        }
        get rawValue() {
            return this.rawValue_;
        }
        set rawValue(rawValue) {
            this.setRawValue(rawValue, {
                forceEmit: false,
                last: true,
            });
        }
        setRawValue(rawValue, options) {
            const opts = options !== null && options !== void 0 ? options : {
                forceEmit: false,
                last: true,
            };
            const constrainedValue = this.constraint_
                ? this.constraint_.constrain(rawValue)
                : rawValue;
            const changed = !this.equals_(this.rawValue_, constrainedValue);
            if (!changed && !opts.forceEmit) {
                return;
            }
            this.emitter.emit('beforechange', {
                sender: this,
            });
            this.rawValue_ = constrainedValue;
            this.emitter.emit('change', {
                options: opts,
                rawValue: constrainedValue,
                sender: this,
            });
        }
    }

    class PrimitiveValue {
        constructor(initialValue) {
            this.emitter = new Emitter();
            this.value_ = initialValue;
        }
        get rawValue() {
            return this.value_;
        }
        set rawValue(value) {
            this.setRawValue(value, {
                forceEmit: false,
                last: true,
            });
        }
        setRawValue(value, options) {
            const opts = options !== null && options !== void 0 ? options : {
                forceEmit: false,
                last: true,
            };
            if (this.value_ === value && !opts.forceEmit) {
                return;
            }
            this.emitter.emit('beforechange', {
                sender: this,
            });
            this.value_ = value;
            this.emitter.emit('change', {
                options: opts,
                rawValue: this.value_,
                sender: this,
            });
        }
    }

    function createValue(initialValue, config) {
        const constraint = config === null || config === void 0 ? void 0 : config.constraint;
        const equals = config === null || config === void 0 ? void 0 : config.equals;
        if (!constraint && !equals) {
            return new PrimitiveValue(initialValue);
        }
        return new BoundValue(initialValue, config);
    }

    class ValueMap {
        constructor(valueMap) {
            this.emitter = new Emitter();
            this.valMap_ = valueMap;
            for (const key in this.valMap_) {
                const v = this.valMap_[key];
                v.emitter.on('change', () => {
                    this.emitter.emit('change', {
                        key: key,
                        sender: this,
                    });
                });
            }
        }
        static createCore(initialValue) {
            const keys = Object.keys(initialValue);
            return keys.reduce((o, key) => {
                return Object.assign(o, {
                    [key]: createValue(initialValue[key]),
                });
            }, {});
        }
        static fromObject(initialValue) {
            const core = this.createCore(initialValue);
            return new ValueMap(core);
        }
        get(key) {
            return this.valMap_[key].rawValue;
        }
        set(key, value) {
            this.valMap_[key].rawValue = value;
        }
        value(key) {
            return this.valMap_[key];
        }
    }

    function parseObject(value, keyToParserMap) {
        const keys = Object.keys(keyToParserMap);
        const result = keys.reduce((tmp, key) => {
            if (tmp === undefined) {
                return undefined;
            }
            const parser = keyToParserMap[key];
            const result = parser(value[key]);
            return result.succeeded
                ? Object.assign(Object.assign({}, tmp), { [key]: result.value }) : undefined;
        }, {});
        return forceCast(result);
    }
    function parseArray(value, parseItem) {
        return value.reduce((tmp, item) => {
            if (tmp === undefined) {
                return undefined;
            }
            const result = parseItem(item);
            if (!result.succeeded || result.value === undefined) {
                return undefined;
            }
            return [...tmp, result.value];
        }, []);
    }
    function isObject(value) {
        if (value === null) {
            return false;
        }
        return typeof value === 'object';
    }
    function createParamsParserBuilder(parse) {
        return (optional) => (v) => {
            if (!optional && v === undefined) {
                return {
                    succeeded: false,
                    value: undefined,
                };
            }
            if (optional && v === undefined) {
                return {
                    succeeded: true,
                    value: undefined,
                };
            }
            const result = parse(v);
            return result !== undefined
                ? {
                    succeeded: true,
                    value: result,
                }
                : {
                    succeeded: false,
                    value: undefined,
                };
        };
    }
    function createParamsParserBuilders(optional) {
        return {
            custom: (parse) => createParamsParserBuilder(parse)(optional),
            boolean: createParamsParserBuilder((v) => typeof v === 'boolean' ? v : undefined)(optional),
            number: createParamsParserBuilder((v) => typeof v === 'number' ? v : undefined)(optional),
            string: createParamsParserBuilder((v) => typeof v === 'string' ? v : undefined)(optional),
            function: createParamsParserBuilder((v) =>
            typeof v === 'function' ? v : undefined)(optional),
            constant: (value) => createParamsParserBuilder((v) => (v === value ? value : undefined))(optional),
            raw: createParamsParserBuilder((v) => v)(optional),
            object: (keyToParserMap) => createParamsParserBuilder((v) => {
                if (!isObject(v)) {
                    return undefined;
                }
                return parseObject(v, keyToParserMap);
            })(optional),
            array: (itemParser) => createParamsParserBuilder((v) => {
                if (!Array.isArray(v)) {
                    return undefined;
                }
                return parseArray(v, itemParser);
            })(optional),
        };
    }
    const ParamsParsers = {
        optional: createParamsParserBuilders(true),
        required: createParamsParserBuilders(false),
    };
    function parseParams(value, keyToParserMap) {
        const result = ParamsParsers.required.object(keyToParserMap)(value);
        return result.succeeded ? result.value : undefined;
    }

    function disposeElement(elem) {
        if (elem && elem.parentElement) {
            elem.parentElement.removeChild(elem);
        }
        return null;
    }

    function getAllBladePositions() {
        return ['veryfirst', 'first', 'last', 'verylast'];
    }

    const className$2 = ClassName('');
    const POS_TO_CLASS_NAME_MAP = {
        veryfirst: 'vfst',
        first: 'fst',
        last: 'lst',
        verylast: 'vlst',
    };
    class BladeController {
        constructor(config) {
            this.parent_ = null;
            this.blade = config.blade;
            this.view = config.view;
            this.viewProps = config.viewProps;
            const elem = this.view.element;
            this.blade.value('positions').emitter.on('change', () => {
                getAllBladePositions().forEach((pos) => {
                    elem.classList.remove(className$2(undefined, POS_TO_CLASS_NAME_MAP[pos]));
                });
                this.blade.get('positions').forEach((pos) => {
                    elem.classList.add(className$2(undefined, POS_TO_CLASS_NAME_MAP[pos]));
                });
            });
            this.viewProps.handleDispose(() => {
                disposeElement(elem);
            });
        }
        get parent() {
            return this.parent_;
        }
    }

    function removeChildNodes(element) {
        while (element.childNodes.length > 0) {
            element.removeChild(element.childNodes[0]);
        }
    }

    const className$1 = ClassName('lbl');
    function createLabelNode(doc, label) {
        const frag = doc.createDocumentFragment();
        const lineNodes = label.split('\n').map((line) => {
            return doc.createTextNode(line);
        });
        lineNodes.forEach((lineNode, index) => {
            if (index > 0) {
                frag.appendChild(doc.createElement('br'));
            }
            frag.appendChild(lineNode);
        });
        return frag;
    }
    class LabelView {
        constructor(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$1());
            config.viewProps.bindClassModifiers(this.element);
            const labelElem = doc.createElement('div');
            labelElem.classList.add(className$1('l'));
            bindValueMap(config.props, 'label', (value) => {
                if (isEmpty(value)) {
                    this.element.classList.add(className$1(undefined, 'nol'));
                }
                else {
                    this.element.classList.remove(className$1(undefined, 'nol'));
                    removeChildNodes(labelElem);
                    labelElem.appendChild(createLabelNode(doc, value));
                }
            });
            this.element.appendChild(labelElem);
            this.labelElement = labelElem;
            const valueElem = doc.createElement('div');
            valueElem.classList.add(className$1('v'));
            this.element.appendChild(valueElem);
            this.valueElement = valueElem;
        }
    }

    class LabelController extends BladeController {
        constructor(doc, config) {
            const viewProps = config.valueController.viewProps;
            super(Object.assign(Object.assign({}, config), { view: new LabelView(doc, {
                    props: config.props,
                    viewProps: viewProps,
                }), viewProps: viewProps }));
            this.props = config.props;
            this.valueController = config.valueController;
            this.view.valueElement.appendChild(this.valueController.view.element);
        }
    }

    class ManualTicker {
        constructor() {
            this.disabled = false;
            this.emitter = new Emitter();
        }
        dispose() { }
        tick() {
            if (this.disabled) {
                return;
            }
            this.emitter.emit('tick', {
                sender: this,
            });
        }
    }

    class IntervalTicker {
        constructor(doc, interval) {
            this.disabled_ = false;
            this.timerId_ = null;
            this.onTick_ = this.onTick_.bind(this);
            this.doc_ = doc;
            this.emitter = new Emitter();
            this.interval_ = interval;
            this.setTimer_();
        }
        get disabled() {
            return this.disabled_;
        }
        set disabled(inactive) {
            this.disabled_ = inactive;
            if (this.disabled_) {
                this.clearTimer_();
            }
            else {
                this.setTimer_();
            }
        }
        dispose() {
            this.clearTimer_();
        }
        clearTimer_() {
            if (this.timerId_ === null) {
                return;
            }
            const win = this.doc_.defaultView;
            if (win) {
                win.clearInterval(this.timerId_);
            }
            this.timerId_ = null;
        }
        setTimer_() {
            this.clearTimer_();
            if (this.interval_ <= 0) {
                return;
            }
            const win = this.doc_.defaultView;
            if (win) {
                this.timerId_ = win.setInterval(this.onTick_, this.interval_);
            }
        }
        onTick_() {
            if (this.disabled_) {
                return;
            }
            this.emitter.emit('tick', {
                sender: this,
            });
        }
    }

    const Constants = {
        monitor: {
            defaultInterval: 200,
            defaultLineCount: 3,
        },
    };

    class ProfilerBladeApi extends BladeApi {
        measure(path, fn) {
            this.controller_.valueController.measure(path, fn);
        }
        get measureHandler() {
            return this.controller_.valueController.measureHandler;
        }
        set measureHandler(measureHandler) {
            this.controller_.valueController.measureHandler = measureHandler;
        }
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    class ConsecutiveCacheMap {
        constructor() {
            this.__map = new Map();
            this.__setUsed = new Set();
        }
        get(key) {
            this.__setUsed.add(key);
            return this.__map.get(key);
        }
        getOrCreate(key, create) {
            this.__setUsed.add(key);
            let value = this.__map.get(key);
            if (value == null) {
                value = create();
                this.__map.set(key, value);
            }
            return value;
        }
        set(key, value) {
            this.__setUsed.add(key);
            this.__map.set(key, value);
        }
        resetUsedSet() {
            this.__setUsed.clear();
        }
        vaporize(onVaporize) {
            Array.from(this.__map.entries()).forEach(([key, value]) => {
                if (!this.__setUsed.has(key)) {
                    this.__map.delete(key);
                    onVaporize === null || onVaporize === void 0 ? void 0 : onVaporize([key, value]);
                }
            });
        }
    }

    // yoinked from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
    function binarySearch(array, elementOrCompare) {
        if (typeof elementOrCompare !== 'function') {
            return binarySearch(array, (element) => (element < elementOrCompare));
        }
        const compare = elementOrCompare;
        let start = 0;
        let end = array.length;
        while (start < end) {
            const center = (start + end) >> 1;
            const centerElement = array[center];
            const compareResult = compare(centerElement);
            if (compareResult) {
                start = center + 1;
            }
            else {
                end = center;
            }
        }
        return start;
    }

    /**
     * Useful for fps calc
     * See also: {@link HistoryMeanCalculator}
     */
    class HistoryPercentileCalculator {
        constructor(length) {
            this.__history = [];
            this.__sorted = [];
            this.__index = 0;
            this.__length = length;
        }
        get median() {
            return this.percentile(50.0);
        }
        percentile(percentile) {
            if (this.__history.length === 0) {
                return 0.0;
            }
            return this.__sorted[Math.round(percentile * 0.01 * (this.__history.length - 1))];
        }
        reset() {
            this.__index = 0;
            this.__history = [];
            this.__sorted = [];
        }
        push(value) {
            const prev = this.__history[this.__index];
            this.__history[this.__index] = value;
            this.__index = (this.__index + 1) % this.__length;
            // remove the prev from sorted array
            if (this.__sorted.length === this.__length) {
                const prevIndex = binarySearch(this.__sorted, prev);
                this.__sorted.splice(prevIndex, 1);
            }
            const index = binarySearch(this.__sorted, value);
            this.__sorted.splice(index, 0, value);
        }
    }

    class LatestPromiseHandler {
        constructor(handler) {
            this.handler = handler;
            this.id_ = 0;
            this.latestResolved_ = -1;
        }
        add(promise) {
            const id = this.id_;
            this.id_++;
            promise.then((value) => {
                if (id > this.latestResolved_) {
                    this.handler(value);
                    this.latestResolved_ = id;
                }
            });
        }
    }

    function dot(a, b) {
        let sum = 0.0;
        for (let i = 0; i < a.length; i++) {
            sum += a[i] * b[i];
        }
        return sum;
    }

    function saturate(x) {
        return Math.min(Math.max(x, 0.0), 1.0);
    }

    function rgbArrayToCssString(array) {
        const arrayPrepared = array.map((v) => saturate(v) * 256.0);
        return `rgb( ${arrayPrepared.join(', ')} )`;
    }

    /**
     * Generate Trubo colormap
     *
     * Yoinked from https://gist.github.com/mikhailov-work/0d177465a8151eb6ede1768d51d476c7
     *
     * Copyright 2019 Google LLC.
     * Apache-2.0 License
     */
    function genTurboColormap(x) {
        const v4KRed = [0.13572138, 4.61539260, -42.66032258, 132.13108234];
        const v4KGreen = [0.09140261, 2.19418839, 4.84296658, -14.18503333];
        const v4KBlue = [0.10667330, 12.64194608, -60.58204836, 110.36276771];
        const v2KRed = [-152.94239396, 59.28637943];
        const v2KGreen = [4.27729857, 2.82956604];
        const v2KBlue = [-89.90310912, 27.34824973];
        x = saturate(x);
        const v4 = [1.0, x, x * x, x * x * x];
        const v2 = [v4[2], v4[3]].map((v) => v * v4[2]);
        const color = [
            dot(v4, v4KRed) + dot(v2, v2KRed),
            dot(v4, v4KGreen) + dot(v2, v2KGreen),
            dot(v4, v4KBlue) + dot(v2, v2KBlue)
        ];
        return rgbArrayToCssString(color);
    }

    // Create a class name generator from the view name
    // ClassName('tmp') will generate a CSS class name like `tp-tmpv`
    const className = ClassName('profiler');
    // Custom view class should implement `View` interface
    class ProfilerBladeView {
        constructor(doc, config) {
            this.targetDelta = config.targetDelta;
            this.deltaUnit = config.deltaUnit;
            this.fractionDigits = config.fractionDigits;
            this.element = doc.createElement('div');
            this.element.classList.add(className());
            config.viewProps.bindClassModifiers(this.element);
            this.svgRootElement_ = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgRootElement_.classList.add(className('root'));
            this.element.appendChild(this.svgRootElement_);
            this.entryContainerElement_ = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.entryContainerElement_.classList.add(className('container'));
            this.entryContainerElement_.setAttribute('transform', 'translate( 1, 1 )');
            this.svgRootElement_.appendChild(this.entryContainerElement_);
            this.tooltipElement_ = doc.createElement('div');
            this.tooltipElement_.classList.add(className('tooltip'));
            this.tooltipElement_.style.display = 'none';
            this.element.appendChild(this.tooltipElement_);
            this.tooltipInsideElement_ = doc.createElement('div');
            this.tooltipInsideElement_.classList.add(className('tooltipinside'));
            this.tooltipElement_.appendChild(this.tooltipInsideElement_);
            this.labelElement_ = doc.createElement('div');
            this.labelElement_.classList.add(className('label'));
            this.labelElement_.textContent = this.deltaToDisplayDelta(0.0);
            this.element.appendChild(this.labelElement_);
            this.entryElementCacheMap_ = new ConsecutiveCacheMap();
            this.hoveringEntry_ = null;
        }
        update(rootEntry) {
            this.labelElement_.textContent = this.deltaToDisplayDelta(rootEntry.deltaMedian);
            this.entryElementCacheMap_.resetUsedSet();
            const unit = 160.0 / Math.max(this.targetDelta, rootEntry.deltaMedian);
            this.addEntry_(rootEntry, this.entryContainerElement_, unit);
            this.entryElementCacheMap_.vaporize(([path, element]) => {
                element.remove();
                if (this.hoveringEntry_ === path) {
                    this.hoveringEntry_ = null;
                }
            });
            this.updateTooltip_();
        }
        updateTooltip_() {
            const path = this.hoveringEntry_;
            if (path) {
                const element = this.entryElementCacheMap_.get(path);
                const dataDelta = element === null || element === void 0 ? void 0 : element.getAttribute('data-delta');
                const displayDelta = this.deltaToDisplayDelta(parseFloat(dataDelta !== null && dataDelta !== void 0 ? dataDelta : '0.0'));
                const text = `${path}\n${displayDelta}`;
                this.tooltipElement_.style.display = 'block';
                this.tooltipInsideElement_.textContent = text;
            }
            else {
                this.tooltipElement_.style.display = 'none';
            }
        }
        addEntry_(entry, parent, unit) {
            const path = entry.path;
            const g = this.entryElementCacheMap_.getOrCreate(path, () => {
                const newG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                newG.classList.add(className('entry'));
                parent.appendChild(newG);
                this.entryElementCacheMap_.set(path, newG);
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.classList.add(className('entryrect'));
                newG.appendChild(rect);
                rect.addEventListener('mouseenter', () => {
                    this.hoveringEntry_ = path;
                    this.updateTooltip_();
                });
                rect.addEventListener('mouseleave', () => {
                    this.hoveringEntry_ = null;
                    this.updateTooltip_();
                });
                return newG;
            });
            g.setAttribute('data-delta', `${entry.deltaMedian}`);
            const rect = g.childNodes[0];
            rect.setAttribute('width', `${Math.max(0.01, entry.deltaMedian * unit - 1.0)}px`);
            rect.setAttribute('height', `${9}px`);
            const turboX = 0.15 + 0.7 * saturate(entry.deltaMedian / this.targetDelta);
            rect.setAttribute('fill', genTurboColormap(turboX));
            if (entry.children.length > 0) {
                let x = 0.0;
                entry.children.forEach((child) => {
                    const childElement = this.addEntry_(child, g, unit);
                    childElement.setAttribute('transform', `translate( ${x}, ${10.0} )`);
                    x += child.deltaMedian * unit;
                });
            }
            return g;
        }
        deltaToDisplayDelta(delta) {
            return `${delta.toFixed(this.fractionDigits)} ${this.deltaUnit}`;
        }
    }

    /**
     * I don't like reduce
     */
    function arraySum(array) {
        let sum = 0.0;
        array.forEach((v) => sum += v);
        return sum;
    }

    // Custom controller class should implement `Controller` interface
    class ProfilerBladeController {
        constructor(doc, config) {
            this.targetDelta = config.targetDelta;
            this.medianBufferSize = config.medianBufferSize;
            this.onTick_ = this.onTick_.bind(this);
            this.ticker_ = config.ticker;
            this.ticker_.emitter.on('tick', this.onTick_);
            this.viewProps = config.viewProps;
            this.view = new ProfilerBladeView(doc, {
                targetDelta: this.targetDelta,
                deltaUnit: config.deltaUnit,
                fractionDigits: config.fractionDigits,
                viewProps: this.viewProps,
            });
            this.viewProps.handleDispose(() => {
                this.ticker_.dispose();
            });
            this.measureHandler = config.measureHandler;
            this.measureStack_ = [];
            this.latestEntry_ = {
                name: 'root',
                path: '/root',
                delta: 0.0,
                deltaMedian: 0.0,
                selfDelta: 0.0,
                selfDeltaMedian: 0.0,
                children: [],
            };
            this.latestPromiseHandler_ = new LatestPromiseHandler((entry) => {
                this.latestEntry_ = entry;
            });
            this.entryCalcCacheMap_ = new ConsecutiveCacheMap();
        }
        measure(name, fn) {
            var _a;
            const parent = this.measureStack_[this.measureStack_.length - 1];
            const path = `${(_a = parent === null || parent === void 0 ? void 0 : parent.path) !== null && _a !== void 0 ? _a : ''}/${name}`;
            if (parent == null) {
                this.entryCalcCacheMap_.resetUsedSet();
            }
            const calc = this.entryCalcCacheMap_.getOrCreate(path, () => {
                return new HistoryPercentileCalculator(this.medianBufferSize);
            });
            const measureStackEntry = {
                path,
                promiseChildren: [],
            };
            this.measureStack_.push(measureStackEntry);
            const promiseEntry = (() => __awaiter(this, void 0, void 0, function* () {
                const delta = yield Promise.resolve(this.measureHandler.measure(path, fn));
                const children = yield Promise.all(measureStackEntry.promiseChildren);
                const sumChildrenDelta = arraySum(children.map((child) => child.delta));
                const selfDelta = delta - sumChildrenDelta;
                calc.push(selfDelta);
                const selfDeltaMedian = calc.median;
                const sumChildDeltaMedian = arraySum(children.map((child) => child.deltaMedian));
                const deltaMedian = selfDeltaMedian + sumChildDeltaMedian;
                return {
                    name,
                    path,
                    delta,
                    deltaMedian,
                    selfDelta,
                    selfDeltaMedian,
                    children,
                };
            }))();
            parent === null || parent === void 0 ? void 0 : parent.promiseChildren.push(promiseEntry);
            this.measureStack_.pop();
            if (parent == null) {
                this.latestPromiseHandler_.add(promiseEntry);
                this.entryCalcCacheMap_.vaporize();
            }
        }
        onTick_() {
            this.view.update(this.latestEntry_);
        }
    }

    function createTicker(document, interval) {
        return interval === 0
            ? new ManualTicker()
            : new IntervalTicker(document, interval !== null && interval !== void 0 ? interval : Constants.monitor.defaultInterval);
    }

    const ProfilerBladePlugin = {
        id: 'profiler',
        type: 'blade',
        css: '.tp-profilerv{position:relative}.tp-profilerv_root{background-color:var(--mo-bg);width:100%;height:calc( 2.0 * var(--bld-us))}.tp-profilerv_entryrect{rx:var(--elm-br);ry:var(--elm-br);stroke:transparent;stroke-width:1px;filter:saturate(0.5)}.tp-profilerv_entryrect:hover{filter:saturate(1)}.tp-profilerv_tooltip{position:absolute;right:100%;top:0;overflow:hidden;background:var(--bs-bg)}.tp-profilerv_tooltipinside{padding:0 4px;overflow:visible;white-space:pre;text-align:right;background:var(--mo-bg);color:var(--in-fg)}.tp-profilerv_label{color:var(--mo-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        accept(params) {
            // Parse parameters object
            const p = ParamsParsers;
            const result = parseParams(params, {
                view: p.required.constant('profiler'),
                targetDelta: p.optional.number,
                medianBufferSize: p.optional.number,
                deltaUnit: p.optional.string,
                fractionDigits: p.optional.number,
                label: p.optional.string,
                interval: p.optional.number,
                measureHandler: p.optional.raw,
            });
            return result ? { params: result } : null;
        },
        controller(args) {
            var _a, _b, _c, _d, _e, _f;
            const interval = (_a = args.params.interval) !== null && _a !== void 0 ? _a : 500;
            const targetDelta = (_b = args.params.targetDelta) !== null && _b !== void 0 ? _b : 16.67;
            const medianBufferSize = (_c = args.params.medianBufferSize) !== null && _c !== void 0 ? _c : 30;
            const deltaUnit = (_d = args.params.deltaUnit) !== null && _d !== void 0 ? _d : 'ms';
            const fractionDigits = (_e = args.params.fractionDigits) !== null && _e !== void 0 ? _e : 2;
            const measureHandler = (_f = args.params.measureHandler) !== null && _f !== void 0 ? _f : new ProfilerBladeDefaultMeasureHandler();
            return new LabelController(args.document, {
                blade: args.blade,
                props: ValueMap.fromObject({
                    label: args.params.label,
                }),
                valueController: new ProfilerBladeController(args.document, {
                    ticker: createTicker(args.document, interval),
                    targetDelta,
                    medianBufferSize,
                    deltaUnit,
                    fractionDigits,
                    viewProps: args.viewProps,
                    measureHandler,
                }),
            });
        },
        api(args) {
            if (!(args.controller instanceof LabelController)) {
                return null;
            }
            if (!(args.controller.valueController instanceof ProfilerBladeController)) {
                return null;
            }
            return new ProfilerBladeApi(args.controller);
        }
    };

    exports.ProfilerBladeDefaultMeasureHandler = ProfilerBladeDefaultMeasureHandler;
    exports.ProfilerBladePlugin = ProfilerBladePlugin;
    exports.plugin = ProfilerBladePlugin;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
