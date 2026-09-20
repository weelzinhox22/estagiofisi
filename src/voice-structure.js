const rules=[
  ['chiefComplaint','Queixa principal',/queix|refere|relata|motivo|dor/i],
  ['clinicalHistory','História clínica',/há |anos|meses|início|começou|históri|diagnóst/i],
  ['pain','Dor',/dor|e.v.a|eva|intensidade|queima|pontada|formig/i],
  ['painWorse','Fatores que pioram',/piora|agrava|quando anda|esforço/i],
  ['painBetter','Fatores que melhoram',/melhora|alivia|repouso/i],
  ['adl','AVDs limitadas',/dificuldade|limit|vestir|pentear|escada|banho|caminhar/i],
  ['medications','Medicamentos',/medica|remédio|fármaco/i],
  ['surgeries','Cirurgias',/cirurg|operad|pós-operat/i],
  ['falls','Quedas',/queda|caiu|tropeç/i],
  ['ambulation','Marcha',/marcha|caminh|deambula|bengala|andador/i],
  ['balanceNotes','Equilíbrio',/equilíbrio|instabil|apoio unipodal/i],
  ['strengthNotes','Força',/força|fraqueza|mrc/i],
  ['coordinationNotes','Coordenação',/coordena|dismetr|tremor/i]
];

export function structureTranscript(text=''){
  const sentences=String(text).split(/(?<=[.!?])\s+|\n+/).map(value=>value.trim()).filter(Boolean),fields={};
  for(const sentence of sentences){
    let matched=false;
    for(const [key,label,pattern] of rules)if(pattern.test(sentence)){fields[key]||={label,value:''};fields[key].value+=(fields[key].value?' ':'')+sentence;matched=true;}
    if(!matched){fields.notes||={label:'Observações',value:''};fields.notes.value+=(fields.notes.value?' ':'')+sentence;}
  }
  return {sourceText:String(text).trim(),fields};
}

export function voiceStructurePreview(draft){
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const rows=Object.entries(draft.fields).map(([name,item])=>`<label class="structure-row"><input type="checkbox" name="structuredField" value="${esc(name)}" checked><span><strong>${esc(item.label)}</strong><textarea data-structured-name="${esc(name)}" rows="2">${esc(item.value)}</textarea></span></label>`).join('');
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal structure-modal" role="dialog" aria-modal="true" aria-label="Revisar ficha sugerida"><div class="modal-head"><div><span class="eyebrow">ÁUDIO → FICHA</span><h2>Revise antes de salvar</h2></div><button type="button" data-action="close-modal" aria-label="Fechar">×</button></div><p>O aplicativo apenas organiza trechos; confirme, edite ou desmarque cada sugestão.</p><form id="voice-structure-form">${rows||'<p>Nenhum campo clínico foi identificado. O texto original permanece no campo ditado.</p>'}<div class="modal-actions"><button class="button ghost" type="button" data-action="close-modal">Cancelar</button><button class="button primary" type="submit">Confirmar ficha</button></div></form></section></div>`;
}
