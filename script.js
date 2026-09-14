const defaultOccurrences=[
 {id:1,date:'24/08/2026',local:'Centro',type:'Entulho',kg:120,priority:'Alta',status:'Em aberto',desc:'Acúmulo próximo à via principal'},
 {id:2,date:'23/08/2026',local:'Região Norte',type:'Plástico',kg:45,priority:'Média',status:'Em andamento',desc:'Materiais recicláveis'},
 {id:3,date:'21/08/2026',local:'Comunidade Rural 08',type:'Orgânico',kg:60,priority:'Baixa',status:'Concluído',desc:'Coleta finalizada'}
];
let occurrences=JSON.parse(localStorage.getItem('lixoZeroOccurrences')||'null')||defaultOccurrences;
let schedules=JSON.parse(localStorage.getItem('lixoZeroSchedules')||'[]');
let currentRole='cidadao';

function persist(){localStorage.setItem('lixoZeroOccurrences',JSON.stringify(occurrences));localStorage.setItem('lixoZeroSchedules',JSON.stringify(schedules))}
function login(){currentRole=document.getElementById('role').value;document.getElementById('login').style.display='none';document.getElementById('app').style.display='grid';document.getElementById('mobilebar').style.display=window.innerWidth<=900?'grid':'none';document.getElementById('userChip').textContent=currentRole==='admin'?'Administrador / Gestor':'Cidadão';document.querySelector('[data-view="admin"]').style.display=currentRole==='admin'?'block':'none';renderAll()}
function quickRegister(){toast('Cadastro demonstrativo criado. Agora você pode entrar.')}
function openView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));const titles={dashboard:'Painel',ocorrencia:'Registrar ocorrência',agendamento:'Agendar coleta',mapa:'Localidades',historico:'Histórico',relatorios:'Relatórios',admin:'Administração'};document.getElementById('pageTitle').textContent=titles[id]||'Lixo Zero MB';renderAll()}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>openView(b.dataset.view));
function toast(msg){let el=document.getElementById('toast');el.textContent=msg;el.style.display='block';setTimeout(()=>el.style.display='none',2200)}
function statusClass(s){return s==='Concluído'?'done':s==='Em andamento'?'progress':s==='Em aberto'?'open':'pending'}
function saveOccurrence(){
 const loc=oLocal.value.trim(),kg=Number(oKg.value||0),desc=oDesc.value.trim();
 if(!loc||!oTipo.value){toast('Preencha os campos obrigatórios');return}
 occurrences.unshift({id:Date.now(),date:new Date().toLocaleDateString('pt-BR'),local:loc,type:oTipo.value,kg,priority:oPrior.value,status:'Em aberto',desc,gps:oGps.value.trim()});
 persist();oLocal.value=oKg.value=oDesc.value=oGps.value='';toast('Ocorrência registrada com sucesso');renderAll();openView('dashboard')
}
function saveSchedule(){
 if(!aLocal.value.trim()||!aData.value){toast('Informe endereço e data');return}
 schedules.unshift({id:Date.now(),type:aTipo.value,kg:Number(aQtd.value||0),local:aLocal.value.trim(),date:aData.value,status:'Pendente'});
 localStorage.setItem('lixoZeroSchedules',JSON.stringify(schedules));toast('Agendamento realizado');aQtd.value=aLocal.value=aData.value='';openView('dashboard')
}
function cycleStatus(id){
 const o=occurrences.find(x=>x.id===id);if(!o)return;
 const flow=['Em aberto','Em andamento','Concluído'];o.status=flow[(flow.indexOf(o.status)+1)%flow.length];persist();renderAll();toast('Status atualizado')
}
function renderAll(){
 const open=occurrences.filter(x=>x.status==='Em aberto').length,prog=occurrences.filter(x=>x.status==='Em andamento').length,done=occurrences.filter(x=>x.status==='Concluído').length,kg=occurrences.reduce((a,b)=>a+Number(b.kg||0),0);
 mOpen.textContent=open;mProg.textContent=prog;mDone.textContent=done;mKg.textContent=kg.toLocaleString('pt-BR');
 recentList.innerHTML=occurrences.slice(0,5).map(o=>`<div class="item"><div><b>${o.local}</b><div class="source">${o.date} • ${o.type}</div></div><span class="badge ${statusClass(o.status)}">${o.status}</span></div>`).join('');
 historyBody.innerHTML=occurrences.map(o=>`<tr><td>${o.date}</td><td>${o.local}</td><td>${o.type}</td><td>${o.kg||0} kg</td><td><span class="badge ${statusClass(o.status)}">${o.status}</span></td></tr>`).join('');
 rTotal.textContent=occurrences.length;rDone.textContent=done;rRate.textContent=(occurrences.length?Math.round(done/occurrences.length*100):0)+'%';rKg.textContent=kg;
 const types={};occurrences.forEach(o=>types[o.type]=(types[o.type]||0)+Number(o.kg||0));typeReport.innerHTML=Object.entries(types).sort((a,b)=>b[1]-a[1]).map(([t,v])=>`<div class="item"><b>${t}</b><span>${v} kg</span></div>`).join('')||'<div class="source">Sem dados.</div>';
 adminList.innerHTML=occurrences.map(o=>`<div class="item"><div><b>${o.local}</b><div class="source">${o.type} • ${o.kg||0} kg</div></div><div><span class="badge ${statusClass(o.status)}">${o.status}</span> <button class="btn ghost" onclick="cycleStatus(${o.id})">Avançar status</button></div></div>`).join('');
}
function exportData(){
 const blob=new Blob([JSON.stringify({occurrences,schedules},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lixo-zero-mb-dados.json';a.click();URL.revokeObjectURL(url)
}
window.addEventListener('resize',()=>{if(document.getElementById('app').style.display!=='none')document.getElementById('mobilebar').style.display=window.innerWidth<=900?'grid':'none'});
renderAll();