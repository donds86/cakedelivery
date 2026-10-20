'use strict';
function maysaCatalog(){return {
 sizes:[[10,4,80],[12,6,100],[15,12,140],[20,22,190],[25,35,260],[30,52,360],[35,76,490]].map(([cm,slices,price])=>({id:'maysa-'+cm,name:cm+' cm',serves:slices+' fatias',price})),
 products:[{id:'chantilly',name:'Bolo com cobertura em chantilly',desc:'Bolo artesanal da Maysa Lima. Escolha o tamanho e os recheios para a sua celebração.',price:80,color:'#e6a0bf',photo:''}],
 fillings:['Brigadeiro','Ninho','Coco','Nutella','Morango','Maracujá','Abacaxi','Nozes','Ameixa','Pêssego','Doce de leite'],
 fillingPrices:Object.fromEntries(['Nutella','Morango','Maracujá','Abacaxi','Nozes','Ameixa','Pêssego','Doce de leite'].map(f=>[f,15])),
 rules:{included:6,extra:0,floor:20,topper:0,reference:80,quantityExtraEnabled:false,topperAvailable:false,premiumMinimum:true},phone:'',
 presentation:{instagram:'@maysalimaconfeitariaartesanal',contact:'99873-6335 · DDD a confirmar',notice:'Cardápio 2026 · Cobertura em chantilly. Topo de bolo não incluso. Recheios especiais têm acréscimo a partir de R$ 15; confirme o valor final com a confeitaria. Quantidade de recheios por bolo a combinar.'}
}}
module.exports={maysaCatalog};
