import { getMessages } from "./store.js";

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const userId=String(req.body?.userId||"").trim().toUpperCase();
  if(!/^SHRV-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(userId)) return res.status(400).json({error:"Invalid ShravChat ID"});

  const messages=await getMessages(userId);
  return res.json({success:true,messages});
}