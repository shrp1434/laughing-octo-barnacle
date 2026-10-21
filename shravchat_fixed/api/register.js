import { getClientIp, getStore, saveUser } from "./store.js";

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const id = String(req.body?.id||"").trim().toUpperCase();
  const name = String(req.body?.name||"").trim();
  if(!/^SHRV-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return res.status(400).json({error:"Invalid ShravChat ID"});
  if(!name || name.length>30) return res.status(400).json({error:"Invalid name"});

  const store = getStore();
  store.users[id] = {id,name,ip:getClientIp(req),online:true,updatedAt:Date.now()};
  await saveUser(store.users[id]);

  return res.json({success:true,user:{id,name}});
}