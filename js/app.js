let ggbApplet = null;
let appletBuildStarted = false;
let lastValidActiveD = 1;
let currentLanguage = 'de';
let currentView = 'intro';
const TRANSFORMED_COLOR = {
  r: 46,
  g: 160,
  b: 67
};

const DEFAULT_VIEW = {
  xmin: -10,
  xmax: 10,
  ymin: -10,
  ymax: 10
};

const DEFAULT_PARAMETERS = {
  a: 1,
  d: 1,
  u: 0,
  v: 0
};

const controls = {
  mainHeading: document.getElementById('mainHeading'),
  introScreen: document.getElementById('introScreen'),
  appScreen: document.getElementById('appScreen'),
  startButton: document.getElementById('startButton'),
  langDeButton: document.getElementById('langDeButton'),
  langEnButton: document.getElementById('langEnButton'),
  introTransformationsTitle: document.getElementById('introTransformationsTitle'),
  introFunctionPreset: document.getElementById('introFunctionPreset'),
  introAEnabled: document.getElementById('introAEnabled'),
  introDEnabled: document.getElementById('introDEnabled'),
  introUEnabled: document.getElementById('introUEnabled'),
  introVEnabled: document.getElementById('introVEnabled'),
  introALabel: document.getElementById('introALabel'),
  introDLabel: document.getElementById('introDLabel'),
  introULabel: document.getElementById('introULabel'),
  introVLabel: document.getElementById('introVLabel'),
  introFunctionTitle: document.getElementById('introFunctionTitle'),
  introNote: document.getElementById('introNote'),

  fInput: document.getElementById('fInput'),
  functionPreset: document.getElementById('functionPreset'),
  appTopSourceLabel: document.getElementById('appTopSourceLabel'),
  appTopFunctionTypeLabel: document.getElementById('appTopFunctionTypeLabel'),

  aEnabled: document.getElementById('aEnabled'),
  dEnabled: document.getElementById('dEnabled'),
  uEnabled: document.getElementById('uEnabled'),
  vEnabled: document.getElementById('vEnabled'),

  aRange: document.getElementById('aRange'),
  aNumber: document.getElementById('aNumber'),
  dRange: document.getElementById('dRange'),
  dNumber: document.getElementById('dNumber'),
  uRange: document.getElementById('uRange'),
  uNumber: document.getElementById('uNumber'),
  vRange: document.getElementById('vRange'),
  vNumber: document.getElementById('vNumber'),

  resetButton: document.getElementById('resetButton'),
  status: document.getElementById('status'),
  formulaTitle: document.getElementById('formulaTitle'),
  formulaMain: document.getElementById('formulaMain'),
  formulaPreview: document.getElementById('formulaPreview'),
  formulaPreviewTitle: document.getElementById('formulaPreviewTitle'),
  paramTitle: document.getElementById('paramTitle'),
  aDescription: document.getElementById('aDescription'),
  dDescription: document.getElementById('dDescription'),
  uDescription: document.getElementById('uDescription'),
  vDescription: document.getElementById('vDescription'),
  diagramTitle: document.getElementById('diagramTitle'),
  diagramContainer: document.getElementById('diagramContainer'),
  diagramFlow: document.getElementById('diagramFlow')
};

const FUNCTION_PRESETS = [
  { value: 'x', de: 'Lineare Funktion: x', en: 'Linear function: x' },
  { value: 'x^2', de: 'Quadratische Funktion: x^2', en: 'Quadratic function: x^2' },
  { value: 'x^3', de: 'Kubische Funktion: x^3', en: 'Cubic function: x^3' },
  { value: 'sqrt(x)', de: 'Wurzelfunktion: sqrt(x)', en: 'Square root function: sqrt(x)' },
  { value: '1/x', de: 'Kehrwertfunktion: 1/x', en: 'Reciprocal function: 1/x' },
  { value: 'abs(x)', de: 'Betragsfunktion: abs(x)', en: 'Absolute value function: abs(x)' },
  { value: 'sin(x)', de: 'Sinusfunktion: sin(x)', en: 'Sine function: sin(x)' },
  { value: 'cos(x)', de: 'Kosinusfunktion: cos(x)', en: 'Cosine function: cos(x)' },
  { value: 'exp(x)', de: 'Exponentialfunktion: exp(x)', en: 'Exponential function: exp(x)' },
  { value: 'ln(x)', de: 'Logarithmusfunktion: ln(x)', en: 'Logarithmic function: ln(x)' },
  { value: '1/(x^2+1)', de: 'Gebrochen-rationale Funktion: 1/(x^2+1)', en: 'Rational function: 1/(x^2+1)' }
];

const TEXT = {
  de: {
    pageTitle: 'Transformation von Funktionen',
    heading: 'Transformation von Funktionen',
    intro: {
      language: 'Sprache',
      chooseTransformations: 'Wähle die Transformationen, die kombiniert werden sollen',
      transformations: {
        a: 'Skalierung in y-Richtung',
        d: 'Skalierung in x-Richtung',
        u: 'Verschiebung in x-Richtung',
        v: 'Verschiebung in y-Richtung'
      },
      chooseFunction: 'Wähle die Funktion',
      note: 'Hinweis: Sämtliche Einstellungen lassen sich auch in der App ändern.',
      start: 'Start'
    },
    app: {
      sourceFunction: 'Ausgangsfunktion:',
      selectFunctionType: 'Funktionstyp auswählen:',
      transformedFunction: 'Transformierte Funktion:',
      transformations: 'Transformationen',
      transformationDescriptions: {
        a: 'Skalierung in y-Richtung um den Faktor <span class="param-name">a</span>',
        d: 'Skalierung in x-Richtung um den Faktor <span class="param-name">d</span> ≠ 0',
        u: 'Verschiebung in x-Richtung um <span class="param-name">u</span>',
        v: 'Verschiebung in y-Richtung um <span class="param-name">v</span>'
      },
      reset: 'Zurücksetzen',
      current: 'Aktuell:',
      blockDiagram: 'Blockschaltbild'
    },
    selectPlaceholder: 'Bitte wählen …',
    status: {
      invalidDNumber: 'Der Parameter d muss eine Zahl sein, wenn die x-Skalierung aktiviert ist.',
      invalidDZero: 'Der Parameter d darf nicht 0 sein, wenn die x-Skalierung aktiviert ist.',
      enterFunction: 'Bitte gib einen Funktionsterm für f(x) ein.',
      invalidFunction: 'Der eingegebene Term für f(x) konnte von GeoGebra nicht interpretiert werden.',
      transformedFunctionFailed: 'Die transformierte Funktion g(x) konnte nicht erzeugt werden.'
    },
    aria: {
      functionInput: 'Funktionsvorschrift für f(x)',
      transformedFunction: 'Transformierte Funktion',
      currentFunction: 'Aktuelle Funktion',
      diagram: 'Blockschaltbild der aktivierten Transformationen',
      enableA: 'a aktivieren',
      enableD: 'd aktivieren',
      enableU: 'u aktivieren',
      enableV: 'v aktivieren'
    }
  },
  en: {
    pageTitle: 'Transformations of Functions',
    heading: 'Transformations of Functions',
    intro: {
      language: 'Language',
      chooseTransformations: 'Choose the transformations to combine',
      transformations: {
        a: 'Scaling in y-direction',
        d: 'Scaling in x-direction',
        u: 'Translation in x-direction',
        v: 'Translation in y-direction'
      },
      chooseFunction: 'Choose the function',
      note: 'Note: All settings can also be changed inside the app.',
      start: 'Start'
    },
    app: {
      sourceFunction: 'Source function:',
      selectFunctionType: 'Select function type:',
      transformedFunction: 'Transformed function:',
      transformations: 'Transformations',
      transformationDescriptions: {
        a: 'Scaling in y-direction by factor <span class="param-name">a</span>',
        d: 'Scaling in x-direction by factor <span class="param-name">d</span> ≠ 0',
        u: 'Translation in x-direction by <span class="param-name">u</span>',
        v: 'Translation in y-direction by <span class="param-name">v</span>'
      },
      reset: 'Reset',
      current: 'Current:',
      blockDiagram: 'Block diagram'
    },
    selectPlaceholder: 'Please choose …',
    status: {
      invalidDNumber: 'Parameter d must be a number when x-scaling is enabled.',
      invalidDZero: 'Parameter d must not be 0 when x-scaling is enabled.',
      enterFunction: 'Please enter a function term for f(x).',
      invalidFunction: 'The entered term for f(x) could not be interpreted by GeoGebra.',
      transformedFunctionFailed: 'The transformed function g(x) could not be created.'
    },
    aria: {
      functionInput: 'Function term for f(x)',
      transformedFunction: 'Transformed function',
      currentFunction: 'Current function',
      diagram: 'Block diagram of the active transformations',
      enableA: 'Enable a',
      enableD: 'Enable d',
      enableU: 'Enable u',
      enableV: 'Enable v'
    }
  }
};

function setStatus(message, isError = false) {
  controls.status.textContent = message;
  controls.status.className = isError ? 'status error' : 'status';
}

function clearStatus() {
  setStatus('');
}

function getTextBundle() {
  return TEXT[currentLanguage];
}

function buildPresetOptionsHtml(includePlaceholder) {
  const texts = getTextBundle();
  const options = [];

  if (includePlaceholder) {
    options.push(`<option value="">${texts.selectPlaceholder}</option>`);
  }

  for (const preset of FUNCTION_PRESETS) {
    options.push(`<option value="${preset.value}">${preset[currentLanguage]}</option>`);
  }

  return options.join('');
}

function refreshPresetOptions(selectEl, includePlaceholder) {
  const currentValue = selectEl.value;
  selectEl.innerHTML = buildPresetOptionsHtml(includePlaceholder);
  const availableValues = new Set(FUNCTION_PRESETS.map(function(preset) {
    return preset.value;
  }));
  if (currentValue === '' || availableValues.has(currentValue)) {
    selectEl.value = currentValue;
  }
}

function updateLanguageButtons() {
  const isGerman = currentLanguage === 'de';
  controls.langDeButton.classList.toggle('is-active', isGerman);
  controls.langEnButton.classList.toggle('is-active', !isGerman);
  controls.langDeButton.setAttribute('aria-pressed', isGerman ? 'true' : 'false');
  controls.langEnButton.setAttribute('aria-pressed', isGerman ? 'false' : 'true');
}

function applyLanguage() {
  const texts = getTextBundle();

  document.documentElement.lang = currentLanguage;
  document.title = texts.pageTitle;

  controls.mainHeading.textContent = texts.heading;
  controls.introTransformationsTitle.textContent = texts.intro.chooseTransformations;
  controls.introALabel.textContent = texts.intro.transformations.a;
  controls.introDLabel.textContent = texts.intro.transformations.d;
  controls.introULabel.textContent = texts.intro.transformations.u;
  controls.introVLabel.textContent = texts.intro.transformations.v;
  controls.introFunctionTitle.textContent = texts.intro.chooseFunction;
  controls.introNote.textContent = texts.intro.note;
  controls.startButton.textContent = texts.intro.start;

  controls.appTopSourceLabel.textContent = texts.app.sourceFunction;
  controls.appTopFunctionTypeLabel.textContent = texts.app.selectFunctionType;
  controls.formulaTitle.textContent = texts.app.transformedFunction;
  controls.paramTitle.textContent = texts.app.transformations;
  controls.aDescription.innerHTML = texts.app.transformationDescriptions.a;
  controls.dDescription.innerHTML = texts.app.transformationDescriptions.d;
  controls.uDescription.innerHTML = texts.app.transformationDescriptions.u;
  controls.vDescription.innerHTML = texts.app.transformationDescriptions.v;
  controls.resetButton.textContent = texts.app.reset;
  controls.formulaPreviewTitle.textContent = texts.app.current;
  controls.diagramTitle.textContent = texts.app.blockDiagram;

  controls.fInput.setAttribute('aria-label', texts.aria.functionInput);
  controls.formulaMain.setAttribute('aria-label', texts.aria.transformedFunction);
  controls.formulaPreview.setAttribute('aria-label', texts.aria.currentFunction);
  controls.diagramContainer.setAttribute('aria-label', texts.aria.diagram);
  controls.introAEnabled.setAttribute('aria-label', texts.aria.enableA);
  controls.introDEnabled.setAttribute('aria-label', texts.aria.enableD);
  controls.introUEnabled.setAttribute('aria-label', texts.aria.enableU);
  controls.introVEnabled.setAttribute('aria-label', texts.aria.enableV);
  controls.aEnabled.setAttribute('aria-label', texts.aria.enableA);
  controls.dEnabled.setAttribute('aria-label', texts.aria.enableD);
  controls.uEnabled.setAttribute('aria-label', texts.aria.enableU);
  controls.vEnabled.setAttribute('aria-label', texts.aria.enableV);

  refreshPresetOptions(controls.introFunctionPreset, false);
  refreshPresetOptions(controls.functionPreset, true);
  updateLanguageButtons();
}

function setLanguage(language) {
  currentLanguage = language === 'en' ? 'en' : 'de';
  applyLanguage();
  syncHistoryState();
}

function syncHistoryState() {
  if (!window.history || typeof window.history.replaceState !== 'function') {
    return;
  }
  window.history.replaceState(
    {
      view: currentView,
      lang: currentLanguage
    },
    '',
    window.location.href
  );
}

function pushHistoryState(view) {
  if (!window.history || typeof window.history.pushState !== 'function') {
    return;
  }
  window.history.pushState(
    {
      view,
      lang: currentLanguage
    },
    '',
    window.location.href
  );
}

function syncPair(rangeEl, numberEl, value) {
  rangeEl.value = String(value);
  numberEl.value = String(value);
}

function getNumberValue(numberEl, fallback = 0) {
  const value = Number(numberEl.value);
  return Number.isFinite(value) ? value : fallback;
}

function formatNumber(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 1e-12) {
    return '0';
  }
  const rounded = Math.round(value * 1000) / 1000;
  if (Math.abs(rounded) < 1e-12) {
    return '0';
  }
  return String(rounded);
}

function valuesEqual(left, right) {
  return Math.abs(left - right) < 1e-12;
}

function paramToken(content) {
  return `\\param{${content}}`;
}

function renderMath(element, latex) {
  if (window.MathJax && typeof MathJax.typesetClear === 'function') {
    MathJax.typesetClear([element]);
  }
  element.innerHTML = latex;
  if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
    MathJax.typesetPromise([element]).catch(function(error) {
      console.error('MathJax rendering failed:', error);
    });
  }
}

function typesetElements(elements) {
  if (window.MathJax && typeof MathJax.typesetClear === 'function') {
    MathJax.typesetClear(elements);
  }
  if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
    MathJax.typesetPromise(elements).catch(function(error) {
      console.error('MathJax rendering failed:', error);
    });
  }
}

function getState() {
  return {
    useA: controls.aEnabled.checked,
    useD: controls.dEnabled.checked,
    useU: controls.uEnabled.checked,
    useV: controls.vEnabled.checked,
    a: getNumberValue(controls.aNumber, 1),
    d: getNumberValue(controls.dNumber, lastValidActiveD),
    u: getNumberValue(controls.uNumber, 0),
    v: getNumberValue(controls.vNumber, 0)
  };
}

function updateParameterAvailability() {
  controls.aRange.disabled = !controls.aEnabled.checked;
  controls.aNumber.disabled = !controls.aEnabled.checked;
  controls.dRange.disabled = !controls.dEnabled.checked;
  controls.dNumber.disabled = !controls.dEnabled.checked;
  controls.uRange.disabled = !controls.uEnabled.checked;
  controls.uNumber.disabled = !controls.uEnabled.checked;
  controls.vRange.disabled = !controls.vEnabled.checked;
  controls.vNumber.disabled = !controls.vEnabled.checked;
}

function hasResettableChanges() {
  return !(
    valuesEqual(getNumberValue(controls.aNumber, DEFAULT_PARAMETERS.a), DEFAULT_PARAMETERS.a) &&
    valuesEqual(getNumberValue(controls.dNumber, DEFAULT_PARAMETERS.d), DEFAULT_PARAMETERS.d) &&
    valuesEqual(getNumberValue(controls.uNumber, DEFAULT_PARAMETERS.u), DEFAULT_PARAMETERS.u) &&
    valuesEqual(getNumberValue(controls.vNumber, DEFAULT_PARAMETERS.v), DEFAULT_PARAMETERS.v)
  );
}

function updateResetButtonState() {
  controls.resetButton.disabled = !hasResettableChanges();
}

function buildDiagramMathHtml(latex, className) {
  return `<span class="${className} mathjax-inline">\\(${latex}\\)</span>`;
}

function buildDiagramBlockHtml(blockLatex, className = '', labelLatex = '') {
  const classes = className ? `diagram-block ${className}` : 'diagram-block';
  const labelHtml = labelLatex
    ? buildDiagramMathHtml(labelLatex, 'diagram-block-top-label')
    : '';
  return `<div class="${classes}">${labelHtml}${buildDiagramMathHtml(blockLatex, 'diagram-block-math')}</div>`;
}

function buildDiagramSegmentHtml(options = {}) {
  const {
    labelLatex = '',
    size = 'full',
    arrow = true
  } = options;
  const labelHtml = labelLatex
    ? buildDiagramMathHtml(labelLatex, 'diagram-connector-label')
    : '';
  const segmentClasses = ['diagram-segment'];
  if (size === 'compact') {
    segmentClasses.push('diagram-segment-compact');
  }
  if (size === 'half') {
    segmentClasses.push('diagram-segment-half');
  }
  const connectorClasses = ['diagram-connector'];
  if (!arrow) {
    connectorClasses.push('diagram-connector-no-arrow');
  }
  return `<span class="${segmentClasses.join(' ')}">${labelHtml}<span class="${connectorClasses.join(' ')}" aria-hidden="true"></span></span>`;
}

function buildDiagramItems(state) {
  const items = [];
  const partialState = {
    ...state,
    useA: false,
    useD: false,
    useU: false,
    useV: false
  };

  if (state.useU) {
    partialState.useU = true;
    items.push({
      blockLatex: String.raw`\overline{x} \mapsto \overline{x} - \param{u}`,
      outputLatex: buildArgumentLatex(partialState, false)
    });
  }

  if (state.useD) {
    partialState.useD = true;
    items.push({
      className: 'diagram-block-compact',
      blockLatex: String.raw`\overline{x} \mapsto \frac{\overline{x}}{\param{d}}`,
      outputLatex: buildArgumentLatex(partialState, false)
    });
  }

  items.push({
    className: 'diagram-block-function',
    labelLatex: 'f',
    blockLatex: String.raw`\overline{x} \mapsto f\!\left(\overline{x}\right)`,
    outputLatex: buildFunctionExpressionLatex(partialState, false)
  });

  if (state.useA) {
    partialState.useA = true;
    items.push({
      className: 'diagram-block-compact',
      blockLatex: String.raw`\overline{x} \mapsto \param{a}\cdot \overline{x}`,
      outputLatex: buildFunctionExpressionLatex(partialState, false)
    });
  }

  if (state.useV) {
    partialState.useV = true;
    items.push({
      blockLatex: String.raw`\overline{x} \mapsto \overline{x} + \param{v}`,
      outputLatex: buildFunctionExpressionLatex(partialState, false)
    });
  }

  return items;
}

function updateBlockDiagram() {
  const state = getState();
  const items = buildDiagramItems(state);
  const outputLatex = buildFunctionExpressionLatex(state, false);
  const groupParts = [
    buildDiagramSegmentHtml({ size: 'half', arrow: true })
  ];

  items.forEach(function(item, index) {
    groupParts.push(buildDiagramBlockHtml(item.blockLatex, item.className || '', item.labelLatex || ''));

    if (index < items.length - 1) {
      groupParts.push(buildDiagramSegmentHtml({ labelLatex: item.outputLatex || '' }));
    }
  });

  groupParts.push(buildDiagramSegmentHtml({ size: 'half', arrow: false }));
  const parts = [
    `<div class="diagram-terminal diagram-terminal-input">${buildDiagramMathHtml('x', 'diagram-terminal-math')}</div>`,
    buildDiagramSegmentHtml({ size: 'half', arrow: false }),
    `<div class="diagram-group">${buildDiagramMathHtml('g', 'diagram-group-label')}<div class="diagram-group-flow">${groupParts.join('')}</div></div>`,
    buildDiagramSegmentHtml({ size: 'half', arrow: true })
  ];

  parts.push(
    `<div class="diagram-terminal diagram-terminal-output">${buildDiagramMathHtml(outputLatex, 'diagram-terminal-math')}</div>`
  );

  controls.diagramFlow.innerHTML = parts.join('');
  typesetElements([controls.diagramFlow]);
}

function buildArgumentLatex(state, useValues) {
  let arg = 'x';
  if (state.useU) {
    const token = useValues ? paramToken(formatNumber(Math.abs(state.u))) : paramToken('u');
    if (Math.abs(state.u) < 1e-12 && useValues) {
      arg = `x - ${paramToken('0')}`;
    } else if (useValues) {
      arg = state.u >= 0 ? `x - ${token}` : `x + ${token}`;
    } else {
      arg = `x - ${token}`;
    }
  }
  if (state.useD) {
    const denom = useValues ? paramToken(formatNumber(state.d)) : paramToken('d');
    arg = `\\frac{${arg}}{${denom}}`;
  }
  return arg;
}

function buildFunctionExpressionLatex(state, useValues) {
  const inner = buildArgumentLatex(state, useValues);
  let expr = `f\\!\\left(${inner}\\right)`;
  if (state.useA) {
    const factor = useValues ? paramToken(formatNumber(state.a)) : paramToken('a');
    expr = `${factor}\\,${expr}`;
  }
  if (state.useV) {
    if (useValues) {
      if (Math.abs(state.v) < 1e-12) {
        expr = `${expr} + ${paramToken('0')}`;
      } else {
        const magnitude = paramToken(formatNumber(Math.abs(state.v)));
        expr = state.v >= 0 ? `${expr} + ${magnitude}` : `${expr} - ${magnitude}`;
      }
    } else {
      expr = `${expr} + ${paramToken('v')}`;
    }
  }
  return expr;
}

function buildFunctionLatex(state, useValues) {
  const expr = buildFunctionExpressionLatex(state, useValues);
  return String.raw`\(
        g(x) = ${expr}
      \)`;
}

function tokenizeExpression(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      const start = index;
      index += 1;
      while (index < source.length && /[0-9.]/.test(source[index])) {
        index += 1;
      }
      tokens.push({ type: 'number', value: source.slice(start, index) });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      const start = index;
      index += 1;
      while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) {
        index += 1;
      }
      tokens.push({ type: 'identifier', value: source.slice(start, index) });
      continue;
    }
    if ('+-*/^(),'.includes(char)) {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }
    throw new Error(`Unexpected character: ${char}`);
  }
  return insertImplicitMultiplication(tokens);
}

function insertImplicitMultiplication(tokens) {
  const result = [];

  function canEnd(token) {
    return token && ['number', 'identifier', ')'].includes(token.type);
  }

  function canStart(token) {
    return token && ['number', 'identifier', '('].includes(token.type);
  }

  function isFunctionLike(token) {
    return token && token.type === 'identifier' && ['sin', 'cos', 'tan', 'sqrt', 'ln', 'exp', 'abs', 'log'].includes(token.value);
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    result.push(current);
    if (!next) {
      continue;
    }
    if (canEnd(current) && canStart(next)) {
      if (current.type === 'identifier' && isFunctionLike(current) && next.type === '(') {
        continue;
      }
      result.push({ type: '*', value: '*' });
    }
  }

  return result;
}

function parseExpressionToAst(source) {
  const tokens = tokenizeExpression(source);
  let position = 0;

  function peek() {
    return tokens[position] || null;
  }

  function consume(expectedType = null) {
    const token = peek();
    if (!token) {
      throw new Error('Unexpected end of input');
    }
    if (expectedType && token.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${token.type}`);
    }
    position += 1;
    return token;
  }

  function parsePrimary() {
    const token = peek();
    if (!token) {
      throw new Error('Unexpected end of input');
    }
    if (token.type === 'number') {
      consume();
      return { type: 'number', value: token.value };
    }
    if (token.type === 'identifier') {
      consume();
      if (peek() && peek().type === '(') {
        consume('(');
        const argument = parseAddSub();
        consume(')');
        return { type: 'function', name: token.value, argument };
      }
      return { type: 'identifier', name: token.value };
    }
    if (token.type === '(') {
      consume('(');
      const expression = parseAddSub();
      consume(')');
      return { type: 'group', expression };
    }
    if (token.type === '+') {
      consume('+');
      return { type: 'unary', operator: '+', argument: parsePrimary() };
    }
    if (token.type === '-') {
      consume('-');
      return { type: 'unary', operator: '-', argument: parsePrimary() };
    }
    throw new Error(`Unexpected token: ${token.type}`);
  }

  function parsePower() {
    let left = parsePrimary();
    while (peek() && peek().type === '^') {
      consume('^');
      const right = parsePower();
      left = { type: 'binary', operator: '^', left, right };
    }
    return left;
  }

  function parseMulDiv() {
    let left = parsePower();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const operator = consume().type;
      const right = parsePower();
      left = { type: 'binary', operator, left, right };
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDiv();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const operator = consume().type;
      const right = parseMulDiv();
      left = { type: 'binary', operator, left, right };
    }
    return left;
  }

  const ast = parseAddSub();
  if (position !== tokens.length) {
    throw new Error('Unexpected trailing tokens');
  }
  return ast;
}

function wrapLatexIfNeeded(latex, needsWrap) {
  return needsWrap ? `\\left(${latex}\\right)` : latex;
}

function astToLatex(node, variableLatex = 'x') {
  function render(current) {
    switch (current.type) {
      case 'number':
        return { latex: current.value, precedence: 5 };
      case 'identifier':
        if (current.name === 'x') {
          return {
            latex: variableLatex,
            precedence: variableLatex === 'x' ? 5 : 0
          };
        }
        if (current.name === 'pi') {
          return { latex: '\\pi', precedence: 5 };
        }
        if (current.name === 'e') {
          return { latex: 'e', precedence: 5 };
        }
        return { latex: `\\mathrm{${current.name}}`, precedence: 5 };
      case 'group': {
        const inner = render(current.expression);
        return { latex: `\\left(${inner.latex}\\right)`, precedence: 5 };
      }
      case 'unary': {
        const argument = render(current.argument);
        if (current.operator === '+') {
          return { latex: argument.latex, precedence: 4 };
        }
        return {
          latex: `-${wrapLatexIfNeeded(argument.latex, argument.precedence < 4)}`,
          precedence: 4
        };
      }
      case 'function': {
        const argument = render(current.argument).latex;
        if (current.name === 'sqrt') {
          return { latex: `\\sqrt{${argument}}`, precedence: 5 };
        }
        if (current.name === 'abs') {
          return { latex: `\\left|${argument}\\right|`, precedence: 5 };
        }
        if (current.name === 'exp') {
          return { latex: `e^{${argument}}`, precedence: 5 };
        }
        if (['sin', 'cos', 'tan', 'ln', 'log'].includes(current.name)) {
          return { latex: `\\${current.name}\\!\\left(${argument}\\right)`, precedence: 5 };
        }
        return { latex: `\\mathrm{${current.name}}\\!\\left(${argument}\\right)`, precedence: 5 };
      }
      case 'binary':
        if (current.operator === '^') {
          const left = render(current.left);
          const right = render(current.right);
          const base = wrapLatexIfNeeded(left.latex, left.precedence < 3);
          return { latex: `${base}^{${right.latex}}`, precedence: 3 };
        }
        if (current.operator === '*') {
          const left = render(current.left);
          const right = render(current.right);
          const leftLatex = wrapLatexIfNeeded(left.latex, left.precedence < 2);
          const rightLatex = wrapLatexIfNeeded(right.latex, right.precedence < 2);
          return { latex: `${leftLatex} \\cdot ${rightLatex}`, precedence: 2 };
        }
        if (current.operator === '/') {
          const left = render(current.left);
          const right = render(current.right);
          return { latex: `\\frac{${left.latex}}{${right.latex}}`, precedence: 2 };
        }
        if (current.operator === '+' || current.operator === '-') {
          const left = render(current.left);
          const right = render(current.right);
          const leftLatex = wrapLatexIfNeeded(left.latex, left.precedence < 1);
          const rightLatex = wrapLatexIfNeeded(right.latex, right.precedence < 1);
          return { latex: `${leftLatex} ${current.operator} ${rightLatex}`, precedence: 1 };
        }
    }
    throw new Error('Unsupported AST node');
  }

  return render(node).latex;
}

function buildExpandedFunctionExpressionLatex(state) {
  const source = controls.fInput.value.trim();
  if (!source) {
    return null;
  }
  try {
    const ast = parseExpressionToAst(source);
    const inner = buildArgumentLatex(state, true);
    let expr = astToLatex(ast, inner);
    if (state.useA) {
      expr = `${paramToken(formatNumber(state.a))}\\,${expr}`;
    }
    if (state.useV) {
      if (Math.abs(state.v) < 1e-12) {
        expr = `${expr} + ${paramToken('0')}`;
      } else {
        const magnitude = paramToken(formatNumber(Math.abs(state.v)));
        expr = state.v >= 0 ? `${expr} + ${magnitude}` : `${expr} - ${magnitude}`;
      }
    }
    return expr;
  } catch (error) {
    console.warn('Could not expand function term for display:', error);
    return null;
  }
}

function updateFormulaDisplays() {
  const state = getState();
  renderMath(controls.formulaMain, buildFunctionLatex(state, false));

  const currentExpr = buildFunctionExpressionLatex(state, true);
  const expandedExpr = buildExpandedFunctionExpressionLatex(state);
  const previewLatex = expandedExpr
    ? String.raw`\[
          \begin{aligned}
          g(x) &= ${currentExpr} \\
               &= ${expandedExpr}
          \end{aligned}
        \]`
    : String.raw`\[
          g(x) = ${currentExpr}
        \]`;
  renderMath(controls.formulaPreview, previewLatex);
}

function validateDWhenActive() {
  const texts = getTextBundle();
  const state = getState();
  if (!state.useD) {
    clearStatus();
    return true;
  }

  const d = Number(controls.dNumber.value);
  if (!Number.isFinite(d)) {
    syncPair(controls.dRange, controls.dNumber, lastValidActiveD);
    setStatus(texts.status.invalidDNumber, true);
    return false;
  }

  if (Math.abs(d) < 1e-12) {
    setStatus(texts.status.invalidDZero, true);
    return false;
  }

  lastValidActiveD = d;
  clearStatus();
  return true;
}

function restoreDefaultView() {
  if (!ggbApplet) {
    return;
  }
  ggbApplet.setAxesVisible(true, true);
  ggbApplet.setGridVisible(true);
  ggbApplet.setCoordSystem(
    DEFAULT_VIEW.xmin,
    DEFAULT_VIEW.xmax,
    DEFAULT_VIEW.ymin,
    DEFAULT_VIEW.ymax
  );
  ggbApplet.refreshViews();
}

function buildApplet() {
  if (appletBuildStarted) {
    return;
  }
  appletBuildStarted = true;

  const params = {
    appName: 'graphing',
    width: 1000,
    height: 700,
    showToolBar: false,
    showMenuBar: false,
    showAlgebraInput: false,
    showResetIcon: false,
    enableShiftDragZoom: true,
    showZoomButtons: true,
    borderRadius: 12,
    errorDialogsActive: false,
    useBrowserForJS: true,
    language: currentLanguage,
    appletOnLoad: onAppletLoad
  };

  const applet = new GGBApplet(params, true);
  applet.inject('ggb-element');
}

function syncAppSettingsFromIntro() {
  controls.aEnabled.checked = controls.introAEnabled.checked;
  controls.dEnabled.checked = controls.introDEnabled.checked;
  controls.uEnabled.checked = controls.introUEnabled.checked;
  controls.vEnabled.checked = controls.introVEnabled.checked;

  controls.functionPreset.value = controls.introFunctionPreset.value;
  controls.fInput.value = controls.introFunctionPreset.value;
}

function showIntroScreen() {
  currentView = 'intro';
  controls.introScreen.classList.remove('hidden');
  controls.appScreen.classList.add('hidden');
}

function showAppScreen(options = {}) {
  const {
    syncFromIntro = false,
    pushHistory = false
  } = options;

  if (syncFromIntro) {
    syncAppSettingsFromIntro();
  }

  currentView = 'app';
  controls.introScreen.classList.add('hidden');
  controls.appScreen.classList.remove('hidden');

  updateParameterAvailability();
  updateResetButtonState();
  updateBlockDiagram();
  updateFormulaDisplays();

  if (pushHistory) {
    pushHistoryState('app');
  } else {
    syncHistoryState();
  }

  requestAnimationFrame(function() {
    buildApplet();
    if (ggbApplet) {
      applyAll();
    }
  });
}

function startFromIntro() {
  showAppScreen({
    syncFromIntro: true,
    pushHistory: true
  });
}

function initConstruction() {
  if (!ggbApplet) {
    return;
  }

  ggbApplet.setErrorDialogsActive(false);
  ggbApplet.setRepaintingActive(false);
  ggbApplet.evalCommand('f(x) = x^2');
  ggbApplet.evalCommand('g(x) = f(x)');
  ggbApplet.setCaption('f', 'f');
  ggbApplet.setCaption('g', 'g');
  ggbApplet.setLabelVisible('f', true);
  ggbApplet.setLabelVisible('g', true);
  ggbApplet.setColor('f', 0, 0, 0);
  ggbApplet.setColor('g', TRANSFORMED_COLOR.r, TRANSFORMED_COLOR.g, TRANSFORMED_COLOR.b);
  ggbApplet.setLineThickness('f', 6);
  ggbApplet.setLineThickness('g', 7);
  restoreDefaultView();
  ggbApplet.setRepaintingActive(true);
  clearStatus();
}

function onAppletLoad(api) {
  ggbApplet = api;
  initConstruction();
  applyAll();
}

function applyFunction() {
  const texts = getTextBundle();
  if (!ggbApplet) {
    return false;
  }

  const expr = controls.fInput.value.trim();
  if (!expr) {
    setStatus(texts.status.enterFunction, true);
    return false;
  }

  const success = ggbApplet.evalCommand(`f(x) = ${expr}`);
  if (!success) {
    setStatus(texts.status.invalidFunction, true);
    return false;
  }

  ggbApplet.setCaption('f', 'f');
  ggbApplet.setLabelVisible('f', true);
  ggbApplet.setColor('f', 0, 0, 0);
  return true;
}

function buildGeoGebraExpression(state) {
  let arg = 'x';
  if (state.useU) {
    arg = `(${arg} - (${formatNumber(state.u)}))`;
  }
  if (state.useD) {
    arg = `((${arg}) / (${formatNumber(state.d)}))`;
  }

  let expr = `f(${arg})`;

  if (state.useA) {
    expr = `((${formatNumber(state.a)}) * (${expr}))`;
  }

  if (state.useV) {
    expr = `((${expr}) + (${formatNumber(state.v)}))`;
  }

  return expr;
}

function applyParameters() {
  const texts = getTextBundle();
  if (!ggbApplet) {
    return false;
  }

  if (!validateDWhenActive()) {
    return false;
  }

  const state = getState();
  const expr = buildGeoGebraExpression(state);

  const success = ggbApplet.evalCommand(`g(x) = ${expr}`);
  if (!success) {
    setStatus(texts.status.transformedFunctionFailed, true);
    return false;
  }

  ggbApplet.setCaption('g', 'g');
  ggbApplet.setLabelVisible('g', true);
  ggbApplet.setColor('g', TRANSFORMED_COLOR.r, TRANSFORMED_COLOR.g, TRANSFORMED_COLOR.b);
  return true;
}

function applyAll() {
  updateParameterAvailability();
  updateResetButtonState();
  updateBlockDiagram();
  updateFormulaDisplays();
  const okF = applyFunction();
  const okP = okF && applyParameters();
  if (okF && okP) {
    clearStatus();
  }
}

function resetAll() {
  syncPair(controls.aRange, controls.aNumber, 1);
  syncPair(controls.dRange, controls.dNumber, 1);
  syncPair(controls.uRange, controls.uNumber, 0);
  syncPair(controls.vRange, controls.vNumber, 0);

  lastValidActiveD = 1;

  updateFormulaDisplays();
  updateResetButtonState();
  applyParameters();
  restoreDefaultView();
}

function updateParameterFromRange(rangeEl, numberEl) {
  numberEl.value = rangeEl.value;
  updateResetButtonState();
  updateFormulaDisplays();
}

function updateParameterFromNumber(numberEl, rangeEl) {
  const value = Number(numberEl.value);
  if (Number.isFinite(value)) {
    rangeEl.value = String(value);
  }
  updateResetButtonState();
  updateFormulaDisplays();
}

const pairs = [
  [controls.aRange, controls.aNumber],
  [controls.dRange, controls.dNumber],
  [controls.uRange, controls.uNumber],
  [controls.vRange, controls.vNumber]
];

for (const [rangeEl, numberEl] of pairs) {
  rangeEl.addEventListener('input', function() {
    updateParameterFromRange(rangeEl, numberEl);
    applyParameters();
  });

  numberEl.addEventListener('input', function() {
    updateParameterFromNumber(numberEl, rangeEl);
    applyParameters();
  });
}

const toggles = [
  controls.aEnabled,
  controls.dEnabled,
  controls.uEnabled,
  controls.vEnabled
];

for (const toggle of toggles) {
  toggle.addEventListener('change', function() {
    updateParameterAvailability();
    updateResetButtonState();
    updateBlockDiagram();
    updateFormulaDisplays();
    applyParameters();
  });
}

controls.resetButton.addEventListener('click', resetAll);

controls.fInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    applyAll();
  }
});

controls.fInput.addEventListener('change', applyAll);

controls.functionPreset.addEventListener('change', function() {
  if (!controls.functionPreset.value) {
    return;
  }
  controls.fInput.value = controls.functionPreset.value;
  applyAll();
});

controls.langDeButton.addEventListener('click', function() {
  setLanguage('de');
});

controls.langEnButton.addEventListener('click', function() {
  setLanguage('en');
});

window.addEventListener('popstate', function(event) {
  const nextState = event.state || { view: 'intro', lang: currentLanguage };
  if (nextState.lang && nextState.lang !== currentLanguage) {
    currentLanguage = nextState.lang === 'en' ? 'en' : 'de';
    applyLanguage();
  }

  if (nextState.view === 'app') {
    showAppScreen({
      syncFromIntro: !appletBuildStarted,
      pushHistory: false
    });
    return;
  }

  showIntroScreen();
  syncHistoryState();
});

const initialState = window.history && window.history.state ? window.history.state : null;
if (initialState && initialState.lang) {
  currentLanguage = initialState.lang === 'en' ? 'en' : 'de';
}

applyLanguage();
if (initialState && initialState.view === 'app') {
  showIntroScreen();
  pushHistoryState('intro');
} else {
  showIntroScreen();
  syncHistoryState();
}

controls.startButton.addEventListener('click', startFromIntro);
