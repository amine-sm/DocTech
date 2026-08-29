import { apiFetch } from "@/lib/api";
export type SessionUser = { id:number; code:string; firstName:string; lastName:string; email:string; phone?:string|null; status:string; role:{ id:number; code:string; name:string }; permissions?: string[] };
function normalize(raw:any):SessionUser{return {id:Number(raw.id),code:String(raw.code||""),firstName:String(raw.firstName??raw.first_name??""),lastName:String(raw.lastName??raw.last_name??""),email:String(raw.email||""),phone:raw.phone??null,status:String(raw.status||""),role:raw.role||{id:Number(raw.role_id||0),code:String(raw.role_code||""),name:String(raw.role_name||"")},permissions:Array.isArray(raw.permissions)?raw.permissions:[]}}
export async function login(email:string,password:string,rememberMe=false){const r=await apiFetch<any>("/auth/login",{method:"POST",bodyJson:{email,password,rememberMe}});return {...r,user:normalize(r.user||r.data||{})};}
export async function logout(){ return apiFetch("/auth/logout",{method:"POST"}); }
export async function getMe(){const r=await apiFetch<any>("/auth/me");return {...r,user:normalize(r.user||r.data||{})};}
