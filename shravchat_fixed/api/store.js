/*
 * ShravChat storage adapter.
 *
 * Vercel serverless functions do NOT provide a reliable shared
 * in-memory database. For production, set a KV/Redis-compatible
 * store and implement these functions against it.
 *
 * The fallback below is deliberately only an in-process demo
 * store; it is not persistent and should not be treated as
 * production storage.
 */

const globalStore = globalThis.__shravchat_store || {
  users: {},
  messages: []
};
globalThis.__shravchat_store = globalStore;

export function getStore(){ return globalStore; }

export function getClientIp(req){
  const forwarded = req.headers["x-forwarded-for"];
  if(typeof forwarded==="string" && forwarded.length) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

export async function saveUser(user){
  globalStore.users[user.id]=user;
  return user;
}

export async function findUserByIp(ip){
  const users=Object.values(globalStore.users);
  return users.find(u=>u.ip===ip) || null;
}

export async function saveMessage(message){
  globalStore.messages.push(message);
  return message;
}

export async function getMessages(userId){
  return globalStore.messages.filter(m=>m.recipient===userId).sort((a,b)=>a.createdAt-b.createdAt);
}