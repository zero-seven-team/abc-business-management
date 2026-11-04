const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Chạy schema TypeScript bằng các dependency sẵn có của frontend.
const source = readFileSync(path.join(__dirname, '../src/lib/contractSchema.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const schemaModule = { exports: {} };
new Function('require', 'exports', compiled)(require, schemaModule.exports);
const { parseContractValue, serializeContractDraft, createContractSchema } = schemaModule.exports;
const amountSchema = createContractSchema.innerType().shape.contractValue;

test('preserves decimal amounts and both decimal separators', () => {
  for (const [input, expected] of [
    ['125000000.50', '125000000.50'], ['125000000,50', '125000000.50'],
    ['0,01', '0.01'], ['00012.5', '12.50'], [' 100 ', '100.00'],
    ['999999999999999.99', '999999999999999.99'],
  ]) {
    assert.equal(parseContractValue(input), expected);
    assert.equal(amountSchema.safeParse(input).success, true);
  }
});

test('rejects negative, zero, grouped, malformed and out-of-range amounts without changing them', () => {
  for (const input of ['', '-500000', '-0.01', '0', '1.234', '1,234',
    '125.000.000', '125,000,000.50', 'abc123', '1e3', '12.', '1.2.3',
    '1000000000000000', '999999999999999.999']) {
    assert.throws(() => parseContractValue(input), undefined, input);
    assert.equal(amountSchema.safeParse(input).success, false, input);
  }
});

test('serializes exact JSON numeric token and escapes other fields', () => {
  const body = serializeContractDraft({ contractValue: '999999999999999.99', contractName: 'A "quoted" name' });
  assert.match(body, /"contractValue":999999999999999\.99}/);
  assert.equal(JSON.parse(body).contractName, 'A "quoted" name');
  assert.equal(serializeContractDraft({ contractValue: '0,01' }), '{"contractValue":0.01}');
  assert.throws(() => serializeContractDraft({ contractValue: '1,"status":"Approved"' }));
});
