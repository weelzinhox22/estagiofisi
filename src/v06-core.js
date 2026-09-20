const clean=value=>String(value??'').trim();
export function numericChange(initial,current){const a=Number(initial),b=Number(current);return Number.isFinite(a)&&Number.isFinite(b)?b-a:null;}
export function formatChange(change,unit=''){return Number.isFinite(change)?`${change>0?'+':''}${Math.round(change*100)/100}${unit}`:'—';}
export function functionalTestSeries(records,patientId,testId){return records.filter(row=>row.patientId===patientId&&row.testId===testId&&Number.isFinite(Number(row.result))).sort((a,b)=>a.date.localeCompare(b.date));}
export function summarizeTestVariation(records,patientId,testId,unit=''){const rows=functionalTestSeries(records,patientId,testId);if(rows.length<2)return null;const change=numericChange(rows[0].result,rows.at(-1).result);return {initial:rows[0],current:rows.at(-1),change,label:formatChange(change,unit)};}
export function movingMedian(values,size=5){const valid=values.filter(Number.isFinite);if(!valid.length)return null;const sample=valid.slice(-Math.max(1,size)).sort((a,b)=>a-b),middle=Math.floor(sample.length/2);return sample.length%2?sample[middle]:(sample[middle-1]+sample[middle])/2;}
export function angleStability(values,size=8){const sample=values.filter(Number.isFinite).slice(-size);if(sample.length<3)return Infinity;const mean=sample.reduce((sum,value)=>sum+value,0)/sample.length;return Math.sqrt(sample.reduce((sum,value)=>sum+(value-mean)**2,0)/sample.length);}
export function readingQuality(points,values=[]){if(!points?.length||points.some(point=>!point))return {level:'insufficient',label:'Insuficiente',capture:false};const visibility=Math.min(...points.map(point=>point.visibility??0));const stability=angleStability(values);if(visibility<.45)return {level:'insufficient',label:'Insuficiente',capture:false};if(visibility>=.75&&stability<=3)return {level:'good',label:'Boa',capture:true};return {level:'moderate',label:'Moderada',capture:true};}
export function reassessmentRows(state,patientId){
  const assessments=state.assessments.filter(row=>row.patientId===patientId&&row.clinical).sort((a,b)=>a.date.localeCompare(b.date));
  const sessions=state.sessions.filter(row=>row.patientId===patientId).sort((a,b)=>a.date.localeCompare(b.date));
  const tests=state.functionalTestResults.filter(row=>row.patientId===patientId).sort((a,b)=>a.date.localeCompare(b.date));
  const rows=[];
  const push=(label,unit,values)=>{if(values.length)rows.push({label,unit,initial:values[0],current:values.at(-1),change:numericChange(values[0],values.at(-1))});};
  push('EVA', '/10',sessions.filter(row=>row.painBefore!==''&&row.painBefore!=null).map(row=>Number(row.painBefore)));
  const groups=(collection,key,value,unit)=>{const map=new Map();for(const row of assessments)for(const item of row.clinical?.[collection]||[]){const id=key(item);const number=Number(value(item));if(id&&Number.isFinite(number)){if(!map.has(id))map.set(id,[]);map.get(id).push(number);}}for(const [label,values] of map)push(label,unit,values);};
  groups('rom',item=>['ADM',item.joint,item.movement,item.side].filter(Boolean).join(' · '),item=>item.degrees,'°');
  groups('strength',item=>['Força',item.movement,item.side].filter(Boolean).join(' · '),item=>item.grade,'/5');
  const testGroups=new Map();for(const row of tests){if(!Number.isFinite(Number(row.result)))continue;if(!testGroups.has(row.testName))testGroups.set(row.testName,[]);testGroups.get(row.testName).push(Number(row.result));}for(const [label,values] of testGroups)push(label,tests.find(row=>row.testName===label)?.unit||'',values);
  return rows;
}
export function buildDischargeReport(values){
  const lines=[values.initialCondition&&`Condição inicial: ${clean(values.initialCondition)}.`,values.currentCondition&&`Condição atual: ${clean(values.currentCondition)}.`,values.achieved&&`Objetivos atingidos: ${clean(values.achieved)}.`,values.partial&&`Objetivos parcialmente atingidos: ${clean(values.partial)}.`,values.notAchieved&&`Objetivos não atingidos: ${clean(values.notAchieved)}.`,values.initialResults&&`Resultados iniciais: ${clean(values.initialResults)}.`,values.finalResults&&`Resultados finais: ${clean(values.finalResults)}.`,values.guidance&&`Orientações registradas: ${clean(values.guidance)}.`,values.followUp&&`Acompanhamento: ${clean(values.followUp)}.`,values.notes&&`Observações: ${clean(values.notes)}.`].filter(Boolean);
  return lines.join('\n\n');
}
