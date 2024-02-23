// import test from 'node:test';
// import assert from 'node:assert';

import { Field } from './Field';
import { Position } from '../types/types';

// test('Field', (t) => {
//   t.test('getFreePositions', () => {
//     const testField = new Field();
//     const positions = [
//       { x: 0, y: 1 },
//       { x: 3, y: 5 },
//       { x: 6, y: 2 },
//     ] satisfies Position[];

//     testField.setValues(positions, true);

//     const result = testField.getFreePositions();
//     console.log(result);
//     assert.strictEqual(result.length, 97);
//   });
// });

const testField = new Field();
const positions = [
  { x: 0, y: 1 },
  { x: 3, y: 5 },
  { x: 6, y: 2 },
] satisfies Position[];

testField.setValues(positions, true);

const result = testField.getEmptyPositions();
console.log(result.length);
// assert.strictEqual(result.length, 97);
