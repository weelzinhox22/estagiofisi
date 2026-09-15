import test from 'node:test';
import assert from 'node:assert/strict';
import { ANGLE_OPTIONS, calculateAngle, selectedPoints, updateRepCounter, framingGuidance } from '../src/camera.js';

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

test('oferece novos segmentos, modos funcionais e orientação de enquadramento', () => {
  assert.ok(Object.keys(ANGLE_OPTIONS).length >= 10);
  assert.ok(ANGLE_OPTIONS.manual.manual);
  const landmarks=Array.from({length:33},()=>({x:.5,y:.5,visibility:1}));
  landmarks[11]={x:.4,y:.2,visibility:1}; landmarks[12]={x:.6,y:.2,visibility:1};
  landmarks[23]={x:.4,y:.5,visibility:1}; landmarks[24]={x:.6,y:.5,visibility:1};
  assert.equal(selectedPoints(landmarks,'trunk','left').length,3);
  assert.match(framingGuidance([{x:.01,y:.5,visibility:1}],landmarks),/Centralize/);
});
