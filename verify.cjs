const fs=require('fs'),vm=require('vm'),assert=require('assert');
const storage=new Map();const nodes={};const context={console,structuredClone,Date,Number,String,Math,JSON,Set,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>{},document:{querySelector:s=>nodes[s]??(nodes[s]={innerHTML:'',style:{},querySelector:()=>null,insertAdjacentHTML:()=>{},focus:()=>{},scrollIntoView:()=>{},reportValidity:()=>true})}};
vm.createContext(context);vm.runInContext(fs.readFileSync('tenancy.js','utf8'),context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
function run(code){return vm.runInContext(code,context)}
assert.equal(run('calc().total'),130);
run("build.fill.push('Morango');build.floors=2;build.topper=true");assert.equal(run('calc().total'),240);
run('db.sizes[2].price=150');assert.equal(run('calc().total'),260);
run('build.product=2');assert.equal(run('calc().total'),270);
for(const p of ['Dashboard','Pedidos','Produtos','Preços','Clientes'])run(`navigate('${p}')`);
run('shop=true;render()');assert(nodes['#app'].innerHTML.includes('Etapa 1 de 6'));assert(!nodes['#app'].innerHTML.includes('Fazer pedido pelo WhatsApp'));
run('wizardNext()');assert.equal(run('wizardStep'),1);
run('wizardNext();build.fill=[];wizardNext()');assert.equal(run('wizardStep'),2);
run("build.fill=['Ninho'];wizardNext();wizardNext()");assert.equal(run('wizardStep'),4);
run("$('#order-form')");nodes['#order-form'].reportValidity=()=>false;run('wizardNext()');assert.equal(run('wizardStep'),4);
nodes['#order-form'].reportValidity=()=>true;
run("build.name='Teste';build.delivery=today();wizardNext()");assert.equal(run('wizardStep'),5);assert(nodes['#app'].innerHTML.includes('Fazer pedido pelo WhatsApp'));
run('wizardGo(1)');assert.equal(run('build.name'),'Teste');assert.equal(run('build.fill[0]'),'Ninho');
for(let i=0;i<6;i++){run('wizardGo('+i+')');assert(nodes['#app'].innerHTML.includes('Etapa '+(i+1)+' de 6'));}
run('changeStatus(1048,"Entregue")');assert.equal(run('db.orders[0].status'),'Entregue');
console.log('OK: cálculos, preços, painel, seis etapas, validação, preservação das escolhas e revisão final.');

for(const node of Object.values(nodes)){node.insertAdjacentHTML=()=>{};node.querySelector=()=>null;}
vm.runInContext(fs.readFileSync('platform.js','utf8'),context);
run('shop=false;save();selectTenant("bella")');assert.equal(run('db.orders.length'),0);
run('db.sizes[0].price=999;save();selectTenant("atelier")');assert.equal(run('db.orders.length'),4);assert.equal(run('db.sizes[0].price'),65);
run('selectTenant("bella")');assert.equal(run('db.sizes[0].price'),999);
run('platformOpen();platformRole="reseller"');assert.equal(run('visibleTenants().length'),2);
run('changeLicense("atelier")');assert.equal(run('platform.tenants[0].status'),'Ativa');
run('changeLicense("bella")');assert.equal(run('licenseValid()'),false);
run('platformView=false;render()');assert(nodes['#app'].innerHTML.includes('Loja temporariamente indisponível'));
run('platformRole="admin";platformView=true;changeLicense("bella")');assert.equal(run('licenseValid()'),true);
run('activeTenant().expires="2020-01-01"');assert.equal(run('licenseValid()'),false);
for(const p of ['Visão geral','Empresas','Licenças','Revendas'])run('platformNavigate('+JSON.stringify(p)+')');
console.log('OK: dados locais separados por tenant, filtro de revenda, bloqueio de licença e telas SaaS.');

