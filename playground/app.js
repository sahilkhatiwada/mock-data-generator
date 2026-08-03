/**
 * mock-data-generator — Playground UI
 * Wires together all controls and delegates generation to window.MockDataGenerator
 */
(function () {
  'use strict';

  var G = window.MockDataGenerator;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };

  var typeTabs      = $('typeTabs');
  var countGroup    = $('countGroup');
  var multiGroup    = $('multiGroup');
  var countSlider   = $('count');
  var countHint     = $('countHint');
  var seedInput     = $('seed');
  var randomSeedBtn = $('randomSeed');
  var clearSeedBtn  = $('clearSeed');
  var fieldsList    = $('fieldsList');
  var addFieldBtn   = $('addField');
  var prettyChk     = $('prettyPrint');
  var syntaxChk     = $('syntaxHL');
  var generateBtn   = $('generateBtn');
  var output        = $('output');
  var copyBtn       = $('copyBtn');
  var downloadBtn   = $('downloadBtn');
  var clearBtn      = $('clearBtn');
  var statCount     = $('statCount');
  var statSize      = $('statSize');
  var statTime      = $('statTime');
  var toast         = $('toast');
  var schemaTabs    = document.querySelectorAll('.schema-tab');
  var schemaOutput  = $('schemaOutput');

  var multiUsersIn    = $('multiUsers');
  var multiProductsIn = $('multiProducts');
  var multiOrdersIn   = $('multiOrders');

  // ── State ──────────────────────────────────────────────────────────────────
  var activeType   = 'users';
  var lastJSON     = '';
  var toastTimer   = null;
  var activeSchema = 'users';

  // ── Schema definitions ─────────────────────────────────────────────────────
  var SCHEMAS = {
    users: [
      '{\n',
      '  "id":         number          — sequential record id\n',
      '  "uuid":       string          — RFC 4122 v4 UUID\n',
      '  "firstName":  string\n',
      '  "lastName":   string\n',
      '  "email":      string          — firstName.lastName@domain\n',
      '  "phone":      string          — (555) XXX-XXXX\n',
      '  "address": {\n',
      '    "street":   string\n',
      '    "city":     string          — one of 30 US cities\n',
      '    "state":    string          — 2-letter code\n',
      '    "zip":      string          — 5 digits\n',
      '    "country":  "US"\n',
      '  }\n',
      '  "status":     active | inactive | suspended | pending\n',
      '  "role":       user | admin | moderator | premium\n',
      '  "age":        number          — 18–80\n',
      '  "createdAt":  ISO 8601 string\n',
      '  "updatedAt":  ISO 8601 string  ≥ createdAt\n',
      '}'
    ].join(''),

    products: [
      '{\n',
      '  "id":           number\n',
      '  "uuid":         string\n',
      '  "name":         string          — adjective + noun\n',
      '  "description":  string          — generated sentence\n',
      '  "price":        number          — 2 decimal places\n',
      '  "category":     string          — one of 10 categories\n',
      '  "subcategory":  string\n',
      '  "sku":          string          — SKU-000001\n',
      '  "inStock":      boolean         — quantity > 0\n',
      '  "quantity":     number          — 0 or 1–500\n',
      '  "rating":       number          — 1.0–5.0\n',
      '  "reviewCount":  number          — 0–5000\n',
      '  "tags":         string[]\n',
      '  "createdAt":    ISO 8601 string\n',
      '  "updatedAt":    ISO 8601 string\n',
      '}'
    ].join(''),

    orders: [
      '{\n',
      '  "id":              number\n',
      '  "uuid":            string\n',
      '  "orderNumber":     string          — ORD-00000001\n',
      '  "userId":          number          — references a user id\n',
      '  "status":          pending | processing | shipped | delivered | cancelled | refunded\n',
      '  "items": [{\n',
      '    "productId":     number\n',
      '    "name":          string\n',
      '    "category":      string\n',
      '    "unitPrice":     number\n',
      '    "quantity":      number\n',
      '    "subtotal":      number\n',
      '  }]\n',
      '  "itemCount":       number\n',
      '  "subtotal":        number\n',
      '  "shippingCost":    number\n',
      '  "tax":             number\n',
      '  "discount":        number\n',
      '  "total":           number\n',
      '  "paymentMethod":   credit_card | debit_card | paypal | apple_pay | google_pay | bank_transfer\n',
      '  "currency":        "USD"\n',
      '  "shippingAddress": { street, city, state, zip, country }\n',
      '  "orderedAt":       ISO 8601 string\n',
      '  "shippedAt":       ISO 8601 string | null\n',
      '  "deliveredAt":     ISO 8601 string | null\n',
      '}'
    ].join('')
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showToast(msg, duration) {
    toast.textContent = msg;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, duration || 2000);
  }

  function formatBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function countRecords(data) {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === 'object') {
      return Object.values(data).reduce(function (s, v) {
        return s + (Array.isArray(v) ? v.length : 0);
      }, 0);
    }
    return 0;
  }

  // ── Syntax highlighter ─────────────────────────────────────────────────────

  function highlight(json) {
    // Escape HTML entities first
    var safe = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return safe.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
      function (match) {
        var cls = 'hl-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'hl-key' : 'hl-str';
        } else if (/true|false/.test(match)) {
          cls = 'hl-bool';
        } else if (/null/.test(match)) {
          cls = 'hl-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  function renderOutput(data) {
    var pretty = prettyChk.checked;
    var useHL  = syntaxChk.checked;
    var json   = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    lastJSON   = json;

    if (useHL) {
      output.innerHTML = highlight(json);
    } else {
      output.textContent = json;
    }

    // stats
    var bytes = new TextEncoder().encode(json).length;
    var n     = countRecords(data);
    statCount.textContent = n + (n === 1 ? ' record' : ' records');
    statSize.textContent  = formatBytes(bytes);
  }

  function renderSchemaPreview(type) {
    schemaOutput.textContent = SCHEMAS[type] || '(no schema available)';
  }

  // ── Type tab switching ─────────────────────────────────────────────────────

  typeTabs.addEventListener('click', function (e) {
    var tab = e.target.closest('.type-tab');
    if (!tab) return;
    document.querySelectorAll('.type-tab').forEach(function (t) { t.classList.remove('type-tab--active'); });
    tab.classList.add('type-tab--active');
    activeType = tab.dataset.type;

    var isMulti = activeType === 'multi';
    multiGroup.style.display = isMulti ? 'block' : 'none';
    countGroup.style.display = isMulti ? 'none'  : 'block';
  });

  // ── Count slider ───────────────────────────────────────────────────────────

  countSlider.addEventListener('input', function () {
    countHint.textContent = countSlider.value;
  });

  // ── Seed controls ──────────────────────────────────────────────────────────

  randomSeedBtn.addEventListener('click', function () {
    seedInput.value = Math.floor(Math.random() * 999999);
  });

  clearSeedBtn.addEventListener('click', function () {
    seedInput.value = '';
  });

  // ── Custom fields ──────────────────────────────────────────────────────────

  function addFieldRow(name, expr) {
    var row = document.createElement('div');
    row.className = 'field-row';

    var nameIn = document.createElement('input');
    nameIn.className = 'input';
    nameIn.placeholder = 'field name';
    nameIn.value = name || '';

    var exprIn = document.createElement('input');
    exprIn.className = 'input';
    exprIn.placeholder = 'e.g. (u) => u.age > 30';
    exprIn.value = expr || '';

    var removeBtn = document.createElement('button');
    removeBtn.className = 'field-remove';
    removeBtn.title = 'Remove field';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function () { row.remove(); });

    row.appendChild(nameIn);
    row.appendChild(exprIn);
    row.appendChild(removeBtn);
    fieldsList.appendChild(row);
  }

  addFieldBtn.addEventListener('click', function () { addFieldRow(); });

  function collectFields() {
    var fields = {};
    var rows = fieldsList.querySelectorAll('.field-row');
    rows.forEach(function (row) {
      var inputs = row.querySelectorAll('input');
      var name   = inputs[0].value.trim();
      var expr   = inputs[1].value.trim();
      if (!name || !expr) return;
      try {
        // eslint-disable-next-line no-new-func
        fields[name] = new Function('return (' + expr + ')')();
      } catch (e) {
        throw new Error('Invalid expression for field "' + name + '": ' + e.message);
      }
    });
    return fields;
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  generateBtn.addEventListener('click', function () {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Generating…';

    // Use setTimeout so the browser can repaint the loading state first
    setTimeout(function () {
      try {
        var fields = collectFields();
        var seedVal = seedInput.value.trim();
        var seed    = seedVal !== '' ? parseInt(seedVal, 10) : undefined;
        var t0      = performance.now();
        var data;

        if (activeType === 'multi') {
          var uCount = parseInt(multiUsersIn.value, 10) || 0;
          var pCount = parseInt(multiProductsIn.value, 10) || 0;
          var oCount = parseInt(multiOrdersIn.value, 10) || 0;
          var typeMap = {};
          if (uCount > 0) typeMap.users    = { count: uCount,    seed: seed, fields: fields };
          if (pCount > 0) typeMap.products = { count: pCount,    seed: seed };
          if (oCount > 0) typeMap.orders   = { count: oCount,    seed: seed };
          if (Object.keys(typeMap).length === 0) throw new Error('Set at least one count > 0');
          data = G.generate(typeMap);
        } else {
          var count = parseInt(countSlider.value, 10);
          var opts  = { count: count, fields: fields };
          if (seed !== undefined) opts.seed = seed;
          data = G.generate(activeType, opts);
        }

        var elapsed = (performance.now() - t0).toFixed(1);
        statTime.textContent = elapsed + ' ms';

        renderOutput(data);
        showToast('✓ Generated in ' + elapsed + ' ms');

      } catch (err) {
        output.innerHTML = '<span style="color:var(--red)">Error: ' + escapeHtml(err.message) + '</span>';
        statCount.textContent = '—';
        statSize.textContent  = '—';
        statTime.textContent  = '—';
        showToast('✗ ' + err.message, 3500);
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn__icon">▶</span> Generate';
      }
    }, 20);
  });

  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Re-render on display toggle without re-generating
  prettyChk.addEventListener('change', function () { if (lastJSON) try { renderOutput(JSON.parse(lastJSON)); } catch(_){} });
  syntaxChk.addEventListener('change', function () { if (lastJSON) try { renderOutput(JSON.parse(lastJSON)); } catch(_){} });

  // ── Copy ───────────────────────────────────────────────────────────────────

  copyBtn.addEventListener('click', function () {
    if (!lastJSON) { showToast('Nothing to copy yet'); return; }
    navigator.clipboard.writeText(lastJSON).then(function () {
      showToast('✓ Copied to clipboard');
    }).catch(function () {
      // Fallback for browsers without clipboard API
      var ta = document.createElement('textarea');
      ta.value = lastJSON;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✓ Copied');
    });
  });

  // ── Download ───────────────────────────────────────────────────────────────

  downloadBtn.addEventListener('click', function () {
    if (!lastJSON) { showToast('Nothing to download yet'); return; }
    var blob = new Blob([lastJSON], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'mock-data-' + activeType + '-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded');
  });

  // ── Clear ──────────────────────────────────────────────────────────────────

  clearBtn.addEventListener('click', function () {
    output.innerHTML = '<span class="output__placeholder">Click <strong>Generate</strong> to produce mock data…</span>';
    lastJSON = '';
    statCount.textContent = '—';
    statSize.textContent  = '—';
    statTime.textContent  = '—';
  });

  // ── Schema tabs ────────────────────────────────────────────────────────────

  schemaTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      schemaTabs.forEach(function (t) { t.classList.remove('schema-tab--active'); });
      tab.classList.add('schema-tab--active');
      activeSchema = tab.dataset.schema;
      renderSchemaPreview(activeSchema);
    });
  });

  // ── Keyboard shortcut: Ctrl+Enter / Cmd+Enter ──────────────────────────────

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateBtn.click();
    }
  });

  // ── Initialise ─────────────────────────────────────────────────────────────

  countHint.textContent = countSlider.value;
  renderSchemaPreview(activeSchema);

  // Pre-load a quick example on first open
  (function preload() {
    try {
      var data = G.generate('users', { count: 3, seed: 42 });
      renderOutput(data);
      statTime.textContent = '< 1 ms';
    } catch (e) {
      // silently ignore if bundle not ready
    }
  }());

}());
