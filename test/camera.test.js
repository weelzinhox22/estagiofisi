import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAngle, selectedPoints, updateRepCounter } from '../src/camera.js';

test('calcula ângulo interno de três pontos', () => {
  assert.equal(Math.round(calculateAngle({x:0,y:0},{x:0,y:1},{x:1,y:1})),90);
  assert.equal(Math.round(calculateAngle({x:0,y:0},{x:1,y:0},{x:2,y:0})),180);
  assert.equal(calculateAngle({x:0,y:0},{x:0,y:0},{x:1,y:1}),null);
  assert.equal(Math.round(calculateAngle({x:0,y:0},{x:0.5,y:0.5},{x:1,y:0},2)),127);
});
test('seleciona índices anatômicos esquerdo e direito', () => {
  const landmarks=Array.from({length:33},(_,index)=>({x:index,y:index}));
  assert.deepEqual(selectedPoints(landmarks,'knee','left').map(x=>x.x),[23,25,27]);
  assert.deepEqual(selectedPoints(landmarks,'knee','right').map(x=>x.x),[24,26,28]);
});
test('contador registra somente ciclo baixo para alto', () => {
  let counter={count:0,phase:'high'};
  counter=updateRepCounter(counter,60,70,150);
  counter=updateRepCounter(counter,100,70,150);
  counter=updateRepCounter(counter,160,70,150);
  counter=updateRepCounter(counter,170,70,150);
  assert.deepEqual(counter,{count:1,phase:'high'});
});
