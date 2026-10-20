'use strict';
const fs=require('node:fs'),path=require('node:path');
async function openDatabase(config={}) {
 const url=config.databaseUrl??process.env.DATABASE_URL;
 if(url){const {Pool}=require('pg');const pool=new Pool({connectionString:url,max:10});await pool.query('SELECT 1');return {kind:'postgres',query:(s,p=[])=>pool.query(s,p),async transaction(fn){const c=await pool.connect();try{await c.query('BEGIN');const result=await fn({query:(s,p=[])=>c.query(s,p)});await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}},close:()=>pool.end()}}
 if((config.production??process.env.NODE_ENV==='production'))throw Error('DATABASE_URL é obrigatória em produção.');
 const {DatabaseSync}=require('node:sqlite');const filename=config.sqlitePath||process.env.SQLITE_PATH||path.join(__dirname,'..','data','development.sqlite');if(filename!==':memory:')fs.mkdirSync(path.dirname(filename),{recursive:true});const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
 function raw(sql,params=[]){const values=[];sql=sql.replace(/\$(\d+)/g,(_,n)=>{values.push(params[Number(n)-1]);return '?'});const st=db.prepare(sql);if(st.columns().length){let rows=st.all(...values);return {rows,rowCount:rows.length}}const result=st.run(...values);return {rows:[],rowCount:Number(result.changes)}}
 let queue=Promise.resolve();function exclusive(fn){let job=queue.then(fn);queue=job.catch(()=>{});return job}
 return {kind:'sqlite',query:(s,p)=>exclusive(()=>raw(s,p)),transaction:fn=>exclusive(async()=>{db.exec('BEGIN IMMEDIATE');try{const result=await fn({query:async(s,p)=>raw(s,p)});db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}),close:()=>exclusive(()=>db.close())};
}
async function migrate(db){const statements=[
`CREATE TABLE IF NOT EXISTS resellers (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, owner TEXT NOT NULL, email TEXT NOT NULL, reseller_id TEXT REFERENCES resellers(id), plan TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('Ativa','Inativa','Suspensa')), expires TEXT NOT NULL, created_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','reseller','tenant')), tenant_id TEXT REFERENCES tenants(id), reseller_id TEXT REFERENCES resellers(id), CHECK((role='admin' AND tenant_id IS NULL AND reseller_id IS NULL) OR (role='reseller' AND tenant_id IS NULL AND reseller_id IS NOT NULL) OR (role='tenant' AND tenant_id IS NOT NULL AND reseller_id IS NULL)))`,
`CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS tenant_data (tenant_id TEXT PRIMARY KEY REFERENCES tenants(id), version INTEGER NOT NULL DEFAULT 1, data TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), request_key TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('Novo','Aceito','Em Produção','Entregue')), created_at TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(tenant_id,request_key))`,
`CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, actor_id TEXT, tenant_id TEXT REFERENCES tenants(id), action TEXT NOT NULL, details TEXT NOT NULL, created_at TEXT NOT NULL)`,
`CREATE INDEX IF NOT EXISTS orders_tenant_created ON orders(tenant_id,created_at)`,
`CREATE INDEX IF NOT EXISTS tenants_reseller ON tenants(reseller_id)`,
`CREATE INDEX IF NOT EXISTS sessions_expiration ON sessions(expires_at)`];await db.transaction(async tx=>{if(db.kind==='postgres')await tx.query('SELECT pg_advisory_xact_lock(79461328)');for(const sql of statements)await tx.query(sql)})}
module.exports={openDatabase,migrate};
