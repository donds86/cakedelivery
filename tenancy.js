// Estado demonstrativo da plataforma. Não substitui autenticação ou isolamento no servidor.
const platformKey='cake-platform-v1';
let platform;try{platform=JSON.parse(localStorage.getItem(platformKey))}catch{}
if(!platform)platform={active:'atelier',resellers:[{id:'direct',name:'Cake Delivery · direto',email:'comercial@cakedelivery.exemplo'},{id:'sweet',name:'Doce Negócio Revendas',email:'contato@docenegocio.exemplo'}],tenants:[{id:'atelier',name:'Doce Ateliê',owner:'Ana Martins',email:'ana@atelie.exemplo',reseller:'direct',plan:'Profissional',status:'Ativa',expires:'2027-12-31'},{id:'bella',name:'Bella Confeitaria',owner:'Isabela Santos',email:'isabela@bella.exemplo',reseller:'sweet',plan:'Essencial',status:'Ativa',expires:'2027-12-31'},{id:'sugar',name:'Açúcar & Afeto',owner:'Marina Lima',email:'marina@acucar.exemplo',reseller:'sweet',plan:'Profissional',status:'Suspensa',expires:'2027-12-31'}]};
function persistPlatform(){localStorage.setItem(platformKey,JSON.stringify(platform))}
function activeTenant(){return platform.tenants.find(t=>t.id===platform.active)||platform.tenants[0]}
function tenantStorageKey(){return 'cake-tenant-'+activeTenant().id}
function readTenant(){let saved=localStorage.getItem(tenantStorageKey());if(!saved&&activeTenant().id==='atelier')saved=localStorage.getItem('doce-atelie-v1');return saved?JSON.parse(saved):null}
function persistTenant(data){localStorage.setItem(tenantStorageKey(),JSON.stringify(data))}
function licenseValid(t=activeTenant()){return t.status==='Ativa'&&t.expires>=today()}
