const $ = id => document.getElementById(id);
let allRows = [];
let demoMode = true;
const fields = ['age','gender','bmi','exercise_level','smoking','alcohol','blood_pressure','cholesterol','glucose','fatigue','chest_pain','dizziness','heart_disease','diabetes','stroke','health_risk_score'];
function makeDemo(){
  const rows=[];
  for(let i=0;i<180;i++){
    const age=18+Math.floor(Math.random()*63), gender=Math.random()<.51?'Female':'Male';
    const heart=(age>48?Math.random()<.43:Math.random()<.12)?1:0;
    const diabetes=(age>42?Math.random()<.35:Math.random()<.13)?1:0;
    rows.push({age,gender,bmi:+(18+Math.random()*17).toFixed(1),exercise_level:Math.ceil(Math.random()*5),smoking:Math.random()<.25?1:0,alcohol:Math.random()<.3?1:0,blood_pressure:90+Math.floor(Math.random()*65),cholesterol:150+Math.floor(Math.random()*130),glucose:70+Math.floor(Math.random()*90),fatigue:Math.random()<.4?1:0,chest_pain:Math.random()<.2?1:0,dizziness:Math.random()<.2?1:0,heart_disease:heart,diabetes,stroke:Math.random()<.06?1:0,health_risk_score:+(Math.random()*10).toFixed(2)});
  }
  return rows;
}
function parseCSV(text){
  const lines=text.trim().split(/\r?\n/); if(lines.length<2) return [];
  const headers=lines[0].split(',').map(s=>s.trim().replace(/^"|"$/g,'').toLowerCase());
  return lines.slice(1).map(line=>{
    const vals=line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.slice(0,-1).map(v=>v.replace(/,$/,'').trim().replace(/^"|"$/g,'').replace(/""/g,'"')) || line.split(',');
    const row={}; headers.forEach((h,i)=>{let v=(vals[i]||'').trim(); if(v!=='' && !isNaN(Number(v))) v=Number(v); row[h]=v;}); return row;
  }).filter(r=>Object.keys(r).length);
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function yes(v){return ['1','yes','true','y','positive'].includes(String(v).trim().toLowerCase()) || (typeof v==='number'&&v>0)}
function get(rows,key){return rows.map(r=>num(r[key]))}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
function countYes(rows,key){return rows.filter(r=>yes(r[key])).length}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function currentRows(){
 const gender=$('genderFilter').value, age=$('ageFilter').value;
 return allRows.filter(r=>{
  const g=String(r.gender??'').toLowerCase();
  if(gender!=='all' && g!==gender.toLowerCase()) return false;
  const a=num(r.age); if(age==='young'&&a>=30)return false;if(age==='middle'&&(a<30||a>=50))return false;if(age==='older'&&a<50)return false;
  return true;
 });
}
function svgStart(w=700,h=250){return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img">`}
function emptyChart(){return '<div style="padding:60px 10px;text-align:center;color:#9aa5b5;font-size:12px">No records match these filters.</div>'}
function barChart(container,labels,values,color='#4378f5',opts={}){
 const el=$(container);if(!values.length||!values.some(v=>v>0)){el.innerHTML=emptyChart();return}
 const w=700,h=250,left=45,right=18,top=12,bottom=42,pw=w-left-right,ph=h-top-bottom,max=Math.max(...values)*1.18||1;
 let s=svgStart(w,h);
 for(let i=0;i<5;i++){let y=top+ph-i*ph/4,val=max*i/4;s+=`<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#edf1f6"/><text x="${left-9}" y="${y+4}" text-anchor="end" fill="#9aa5b5" font-size="10">${Math.round(val*10)/10}</text>`}
 const slot=pw/values.length,bw=Math.min(52,slot*.5);
 values.forEach((v,i)=>{let bh=v/max*ph,x=left+i*slot+(slot-bw)/2,y=top+ph-bh;s+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${Array.isArray(color)?color[i%color.length]:color}"/><text x="${x+bw/2}" y="${Math.max(10,y-6)}" text-anchor="middle" fill="#526078" font-size="10">${opts.decimal?v.toFixed(1):Math.round(v)}</text><text x="${left+i*slot+slot/2}" y="${h-15}" text-anchor="middle" fill="#8491a5" font-size="10">${esc(labels[i])}</text>`});
 s+='</svg>';el.innerHTML=s;
}
function groupedBars(container,labels,series){
 const el=$(container),w=700,h=260,left=45,right=18,top=12,bottom=42,pw=w-left-right,ph=h-top-bottom,max=Math.max(1,...series.flatMap(x=>x.values))*1.15;
 let s=svgStart(w,h);
 for(let i=0;i<5;i++){let y=top+ph-i*ph/4;s+=`<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#edf1f6"/><text x="${left-9}" y="${y+4}" text-anchor="end" fill="#9aa5b5" font-size="10">${Math.round(max*i/4)}</text>`}
 const slot=pw/labels.length,bw=Math.min(24,slot/(series.length+1));
 labels.forEach((label,i)=>{series.forEach((ser,j)=>{const v=ser.values[i]||0,bh=v/max*ph,x=left+i*slot+slot/2-(series.length*bw)/2+j*bw,y=top+ph-bh;s+=`<rect x="${x}" y="${y}" width="${bw-3}" height="${bh}" rx="3" fill="${ser.color}"><title>${ser.name}: ${v}</title></rect>`});s+=`<text x="${left+i*slot+slot/2}" y="${h-15}" text-anchor="middle" fill="#8491a5" font-size="10">${label}</text>`});
 s+='</svg>';el.innerHTML=s;
}
function donut(container,legendId,yesN,noN,yesLabel='With condition',noLabel='Without condition'){
 const total=yesN+noN,el=$(container);
 if(!total){el.innerHTML=emptyChart();$(legendId).innerHTML='';return}
 const pct=yesN/total,circ=2*Math.PI*64,dash=circ*pct;
 el.innerHTML=svgStart(400,200)+`<circle cx="200" cy="94" r="64" fill="none" stroke="#edf1f6" stroke-width="24"/><circle cx="200" cy="94" r="64" fill="none" stroke="#f07878" stroke-width="24" stroke-dasharray="${dash} ${circ-dash}" transform="rotate(-90 200 94)" stroke-linecap="round"/><text x="200" y="91" text-anchor="middle" font-family="Manrope" font-size="25" font-weight="800" fill="#14243c">${(pct*100).toFixed(1)}%</text><text x="200" y="111" text-anchor="middle" font-size="10" fill="#8d99aa">of records</text></svg>`;
 $(legendId).innerHTML=`<span><i style="background:#f07878"></i>${yesLabel}: ${yesN}</span><span><i style="background:#edf1f6"></i>${noLabel}: ${noN}</span>`;
}
function render(){
 const rows=currentRows(),total=rows.length,heart=countYes(rows,'heart_disease'),diab=countYes(rows,'diabetes');
 $('totalRecords').textContent=total.toLocaleString();
 $('avgAge').textContent=total?mean(get(rows,'age')).toFixed(1):'—';
 $('heartCount').textContent=heart.toLocaleString();$('heartRate').textContent=`${total?(heart/total*100).toFixed(1):0}% of current view`;
 $('diabetesCount').textContent=diab.toLocaleString();$('diabetesRate').textContent=`${total?(diab/total*100).toFixed(1):0}% of current view`;
 const bands=[['<30',r=>num(r.age)<30],['30–39',r=>num(r.age)>=30&&num(r.age)<40],['40–49',r=>num(r.age)>=40&&num(r.age)<50],['50–59',r=>num(r.age)>=50&&num(r.age)<60],['60+',r=>num(r.age)>=60]];
 const bandRows=bands.map(b=>rows.filter(b[1]));
 groupedBars('ageChart',bands.map(b=>b[0]),[{name:'Heart disease',color:'#f07878',values:bandRows.map(r=>countYes(r,'heart_disease'))},{name:'Diabetes',color:'#4378f5',values:bandRows.map(r=>countYes(r,'diabetes'))}]);
 donut('heartChart','heartLegend',heart,total-heart,'Heart disease','No heart disease');
 donut('diabetesChart','diabetesLegend',diab,total-diab,'Diabetes','No diabetes');
 const cholesterol=[mean(rows.filter(r=>yes(r.heart_disease)).map(r=>num(r.cholesterol))),mean(rows.filter(r=>!yes(r.heart_disease)).map(r=>num(r.cholesterol)))];
 barChart('cholesterolChart',['Heart disease','No heart disease'],cholesterol,['#f07878','#4378f5'],{decimal:true});
 const genders=[...new Set(allRows.map(r=>String(r.gender||'Unknown')))].sort();
 barChart('genderChart',genders,genders.map(g=>rows.filter(r=>String(r.gender||'Unknown')===g).length),['#4378f5','#8d6ce7','#35b89a']);
 barChart('riskChart',bands.map(b=>b[0]),bandRows.map(r=>mean(r.map(x=>num(x.health_risk_score)))),['#8d6ce7'],{decimal:true});
 $('rowCountTag').textContent=`${total} ROWS`;
 $('dataTable').innerHTML=rows.slice(0,8).map(r=>`<tr><td>${esc(r.age)}</td><td>${esc(r.gender)}</td><td>${esc(r.bmi)}</td><td>${esc(r.blood_pressure)}</td><td>${esc(r.cholesterol)}</td><td><span class="pill ${yes(r.heart_disease)?'yes':'no'}">${yes(r.heart_disease)?'Yes':'No'}</span></td><td><span class="pill ${yes(r.diabetes)?'yes':'no'}">${yes(r.diabetes)?'Yes':'No'}</span></td><td>${esc(r.health_risk_score)}</td></tr>`).join('');
 if(!total)$('dataTable').innerHTML='<tr><td colspan="8">No matching records.</td></tr>';
}
function setData(rows,isDemo){
 allRows=rows;demoMode=isDemo;
 const genders=[...new Set(rows.map(r=>String(r.gender||'Unknown')))].sort();
 $('genderFilter').innerHTML='<option value="all">All genders</option>'+genders.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');
 $('genderFilter').value='all';$('ageFilter').value='all';
 $('dataNotice').innerHTML=isDemo?'<span>ⓘ</span><div><b>Demo data is being shown.</b> Upload your original <code>smart_healthcare_dataset.csv</code> to display your real dashboard figures.</div>':'<span>✓</span><div><b>Your CSV is loaded.</b> Dashboard charts and figures now use your uploaded dataset.</div>';
 $('dataNotice').style.background=isDemo?'#fff9e9':'#eaf9f3';$('dataNotice').style.borderColor=isDemo?'#f6e7b6':'#c7eddf';$('dataNotice').style.color=isDemo?'#856b28':'#267e67';
 render();
}
$('genderFilter').addEventListener('change',render);$('ageFilter').addEventListener('change',render);
$('clearFilters').addEventListener('click',()=>{$('genderFilter').value='all';$('ageFilter').value='all';render()});
$('resetBtn').addEventListener('click',()=>setData(makeDemo(),true));
$('csvFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const rows=parseCSV(await f.text());if(!rows.length)throw Error('No data rows found');setData(rows,false)}catch(err){alert('Could not read this CSV. Please check the file and try again.')}e.target.value=''});
setData(makeDemo(),true);
