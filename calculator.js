(function(){
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.max(0,n||0));
const num=id=>Number(document.getElementById(id)?.value||0);
function taxEstimate(income,regime){
  // Illustrative/configurable slabs only. Verify current official rules before relying on tax figures.
  const standard=75000;
  let x=Math.max(0,income-standard), tax=0;
  const slabs=regime==='old' ? [[250000,0],[250000,.05],[500000,.20],[Infinity,.30]] : [[400000,0],[400000,.05],[400000,.10],[400000,.15],[400000,.20],[Infinity,.30]];
  let used=0;
  for(const [width,rate] of slabs){const take=Math.min(Math.max(x-used,0),width);tax+=take*rate;used+=width;if(x<=used)break;}
  return tax*1.04;
}
function renderMain(){
 const c=num('ctc'), bp=num('basicPct'), hp=num('hraPct'), pp=num('pfPct'), pt=num('pt'), other=num('other');
 const err=document.getElementById('error'); if([c,bp,hp,pp,pt,other].some(v=>v<0)||bp>100||hp>200||pp>100){err.textContent='Please enter valid non-negative values.';return}
 err.textContent='';
 const basic=c*bp/100,hra=basic*hp/100,pf=basic*pp/100,gross=Math.max(0,c-pf);
 const regime=document.querySelector('input[name="regime"]:checked')?.value||'new';
 const tax=taxEstimate(gross,regime), annualDeductions=pf+pt*12+other*12+tax;
 const takeHome=Math.max(0,gross-annualDeductions);
 const r=document.getElementById('results');r.hidden=false;
 r.innerHTML='<div class="big">Estimated monthly in-hand: '+money(takeHome/12)+'</div>'+
 [['Annual CTC',c],['Estimated Gross',gross],['Basic Salary',basic],['HRA',hra],['Employee PF',pf],['Professional Tax',pt*12],['Estimated Income Tax',tax],['Other Deductions',other*12],['Total Deductions',annualDeductions],['Estimated Annual In-Hand',takeHome]].map(([k,v])=>'<div class="result-row"><span>'+k+'</span><strong>'+money(v)+'</strong></div>').join('')+
 '<p><small>Estimate only. Tax rules and employer salary structures vary.</small></p>';
}
function renderGeneric(){
 const app=document.getElementById('app'); if(!app)return; const kind=app.dataset.kind;
 if(kind==='pf'){app.innerHTML='<label>Basic Salary / month (₹)<input id="g1" type="number" min="0" value="30000"></label><label>Employee PF %<input id="g2" type="number" min="0" max="100" value="12"></label><label>Employer PF %<input id="g3" type="number" min="0" max="100" value="12"></label><label>Years<input id="g4" type="number" min="0" value="5"></label><button class="primary" id="go">Calculate</button><div id="out" class="results" hidden></div>'}
 else {app.innerHTML='<label>Annual CTC / Salary (₹)<input id="g1" type="number" min="0" value="600000"></label><button class="primary" id="go">Calculate</button><div id="out" class="results" hidden></div>'}
 document.getElementById('go').onclick=()=>{const v=Number(document.getElementById('g1').value||0),out=document.getElementById('out');out.hidden=false;
 if(kind==='pf'){const ep=v*Number(document.getElementById('g2').value||0)/100,er=v*Number(document.getElementById('g3').value||0)/100,y=Number(document.getElementById('g4').value||0);out.innerHTML='<div class="result-row"><span>Employee contribution / year</span><strong>'+money(ep*12)+'</strong></div><div class="result-row"><span>Employer contribution / year</span><strong>'+money(er*12)+'</strong></div><div class="result-row"><span>Total over '+y+' years</span><strong>'+money((ep+er)*12*y)+'</strong></div>'}
 else {const tax=taxEstimate(v,'new'),take=Math.max(0,v-tax);out.innerHTML='<div class="big">Estimated monthly take-home: '+money(take/12)+'</div><div class="result-row"><span>Estimated annual tax</span><strong>'+money(tax)+'</strong></div><div class="result-row"><span>Estimated annual after-tax</span><strong>'+money(take)+'</strong></div>'}}
}
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('calculate')?.addEventListener('click',renderMain);renderGeneric();const b=document.querySelector('.menu'),n=document.querySelector('nav');if(b&&n)b.addEventListener('click',()=>n.classList.toggle('open'));});
window.salaryTaxEstimate=taxEstimate;window.money=money;
})();