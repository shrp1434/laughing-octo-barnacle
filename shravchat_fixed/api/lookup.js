import { findUserByIp } from "./store.js";

export default async function handler(req,res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const ip = String(req.body?.ip||"").trim();
  const requester = String(req.body?.requester||"").trim().toUpperCase();
  if(!ip) return res.status(400).json({error:"Enter an IP address"});
  if(!requester) return res.status(400).json({error:"Missing requester"});

  const user = await findUserByIp(ip);
  if(!user) return res.json({success:true,user:{id:"UNKNOWN",name:null,online:false}});

  if(user.id===requester) return res.status(400).json({error:"That is your own address"});

  return res.json({success:true,user:{id:user.id,name:user.name,online:true}});
}