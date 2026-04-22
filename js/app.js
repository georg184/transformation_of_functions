let ggbApplet = null;
let appletBuildStarted = false;
let lastValidActiveD = 1;

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
  introScreen: document.getElementById('introScreen'),
  appScreen: document.getElementById('appScreen'),
  startButton: document.getElementById('startButton'),
  introFunctionPreset: document.getElementById('introFunctionPreset'),
  introAEnabled: document.getElementById('introAEnabled'),
  introDEnabled: document.getElementById('introDEnabled'),
  introUEnabled: document.getElementById('introUEnabled'),
  introVEnabled: document.getElementById('introVEnabled'),

  fInput: document.getElementById('fInput'),
  functionPreset: document.getElementById('functionPreset'),

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
  sourceFunctionLine: document.getElementById('sourceFunctionLine'),
  transformationSummary: document.getElementById('transformationSummary'),
  formulaMain: document.getElementById('formulaMain'),
  formulaMainNote: document.getElementById('formulaMainNote'),
  formulaPreview: document.getElementById('formulaPreview'),
  diagramLeft: document.getElementById('diagramLeft'),
  diagramRight: document.getElementById('diagramRight')
};

function setStatus(message, isError = false) {
  controls.status.textContent = message;
  controls.status.className = isError ? 'status error' : 'status';
}

function clearStatus() {
  setStatus('');
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

function buildSummaryItems(state) {
  const items = [];
  if (state.useA) {
    items.push('Skalierung in y-Richtung um den Faktor <span class="inline-param">a</span>');
  }
  if (state.useD) {
    items.push('Skalierung in x-Richtung um den Faktor <span class="inline-param">d</span>');
  }
  if (state.useU) {
    items.push('Verschiebung in x-Richtung um <span class="inline-param">u</span>');
  }
  if (state.useV) {
    items.push('Verschiebung in y-Richtung um <span class="inline-param">v</span>');
  }
  return items;
}

function buildDiagramChain(blocks, side) {
  if (blocks.length === 0) {
    return '';
  }

  const parts = [];

  if (side === 'right') {
    parts.push('<span class="diagram-connector" aria-hidden="true"></span>');
  }

  blocks.forEach(function(block, index) {
    parts.push(`<div class="diagram-block">${block}</div>`);
    if (index < blocks.length - 1) {
      parts.push('<span class="diagram-connector" aria-hidden="true"></span>');
    }
  });

  if (side === 'left') {
    parts.push('<span class="diagram-connector" aria-hidden="true"></span>');
  }

  return parts.join('');
}

function updateBlockDiagram() {
  const state = getState();
  const leftBlocks = [];
  const rightBlocks = [];

  if (state.useU) {
    leftBlocks.push(String.raw`\(
      x \mapsto x-\param{u}
    \)`);
  }
  if (state.useD) {
    leftBlocks.push(String.raw`\(
      x \mapsto \frac{1}{\param{d}}\cdot x
    \)`);
  }
  if (state.useA) {
    rightBlocks.push(String.raw`\(
      x \mapsto \param{a}\cdot x
    \)`);
  }
  if (state.useV) {
    rightBlocks.push(String.raw`\(
      x \mapsto x+\param{v}
    \)`);
  }

  controls.diagramLeft.innerHTML = buildDiagramChain(leftBlocks, 'left');
  controls.diagramRight.innerHTML = buildDiagramChain(rightBlocks, 'right');
  typesetElements([controls.diagramLeft, controls.diagramRight]);
}

function updateSummary() {
  const state = getState();
  const items = buildSummaryItems(state);
  if (items.length === 0) {
    controls.transformationSummary.innerHTML = 'Transformationen: keine aktiv.';
    return;
  }
  const label = items.length === 1 ? 'Transformation' : 'Transformationen';
  controls.transformationSummary.innerHTML = `${label}: ${items.join(', ')}.`;
}

function updateSourceFunctionLine() {
  renderMath(controls.sourceFunctionLine, '<span class="source-label">Ausgangsfunktion:</span> <span class="mathjax-inline">\\(x \\mapsto f(x)\\)</span>');
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
  return String.raw`\[
        g(x) = ${expr}
      \]`;
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

  if (state.useD) {
    renderMath(
      controls.formulaMainNote,
      String.raw`\(\text{Dabei muss } \param{d} \neq 0 \text{ gelten.}\)`
    );
  } else {
    controls.formulaMainNote.innerHTML = '';
  }
}

function validateDWhenActive() {
  const state = getState();
  if (!state.useD) {
    clearStatus();
    return true;
  }

  const d = Number(controls.dNumber.value);
  if (!Number.isFinite(d)) {
    syncPair(controls.dRange, controls.dNumber, lastValidActiveD);
    setStatus('Der Parameter d muss eine Zahl sein, wenn die x-Skalierung aktiviert ist.', true);
    return false;
  }

  if (Math.abs(d) < 1e-12) {
    setStatus('Der Parameter d darf nicht 0 sein, wenn die x-Skalierung aktiviert ist.', true);
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
    language: 'de',
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

function startFromIntro() {
  syncAppSettingsFromIntro();
  controls.introScreen.classList.add('hidden');
  controls.appScreen.classList.remove('hidden');

  updateParameterAvailability();
  updateResetButtonState();
  updateSourceFunctionLine();
  updateSummary();
  updateBlockDiagram();
  updateFormulaDisplays();

  requestAnimationFrame(function() {
    buildApplet();
    if (ggbApplet) {
      applyAll();
    }
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
  ggbApplet.setColor('g', 0, 102, 204);
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
  if (!ggbApplet) {
    return false;
  }

  const expr = controls.fInput.value.trim();
  if (!expr) {
    setStatus('Bitte gib einen Funktionsterm für f(x) ein.', true);
    return false;
  }

  const success = ggbApplet.evalCommand(`f(x) = ${expr}`);
  if (!success) {
    setStatus('Der eingegebene Term für f(x) konnte von GeoGebra nicht interpretiert werden.', true);
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
    setStatus('Die transformierte Funktion g(x) konnte nicht erzeugt werden.', true);
    return false;
  }

  ggbApplet.setCaption('g', 'g');
  ggbApplet.setLabelVisible('g', true);
  ggbApplet.setColor('g', 0, 102, 204);
  return true;
}

function applyAll() {
  updateParameterAvailability();
  updateResetButtonState();
  updateSummary();
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

  updateSummary();
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
    updateSummary();
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

controls.startButton.addEventListener('click', startFromIntro);
