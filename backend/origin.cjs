'use strict';
function originPolicy({publicUrl='',railwayDomain='',production=false}){
 const allowed=new Set();
 if(publicUrl)allowed.add(new URL(publicUrl).origin);
 if(railwayDomain){if(!/^[a-z0-9.-]+$/i.test(railwayDomain))throw Error('RAILWAY_PUBLIC_DOMAIN inválido');allowed.add(new URL('https://'+railwayDomain).origin)}
 return (origin,host)=>{
  if(typeof origin!=='string'||origin==='null')return false;
  let parsed;try{parsed=new URL(origin)}catch{return false}
  if(parsed.origin!==origin)return false;
  if(allowed.has(origin))return true;
  if(production)return false;
  try{const request=new URL('http://'+host),loopback=h=>['localhost','127.0.0.1','[::1]'].includes(h);return parsed.protocol==='http:'&&loopback(parsed.hostname)&&loopback(request.hostname)&&parsed.port===request.port}catch{return false}
 };
}
module.exports={originPolicy};
