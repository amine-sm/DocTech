import { apiFetch } from "@/lib/api";
export type ListResult<T=Record<string,unknown>>={ rows:T[]; pagination?:{page:number;limit:number;total:number;pages:number} };
export async function adminList<T=Record<string,unknown>>(endpoint:string, query=""){ const r=await apiFetch<T[]>(`${endpoint}${query}`); return {rows:r.data||[],pagination:r.pagination} as ListResult<T>; }
export async function adminGet<T=Record<string,unknown>>(endpoint:string,id:number|string){ const r=await apiFetch<T>(`${endpoint}/${id}`); return r.data as T; }
export async function adminCreate(endpoint:string,payload:unknown){ return apiFetch(endpoint,{method:"POST",bodyJson:payload}); }
export async function adminUpdate(endpoint:string,id:number|string,payload:unknown,method:"PUT"|"PATCH"="PUT"){ return apiFetch(`${endpoint}/${id}`,{method,bodyJson:payload}); }
export async function adminDelete(endpoint:string,id:number|string){ return apiFetch(`${endpoint}/${id}`,{method:"DELETE"}); }
