import { getStore, saveMessage } from "./store.js";

const idRe=/^SHRV-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const types=new Set(["text","gif","sticker","image"]);

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const b=req.body||{};
  const sender=String(b.sender||"").trim().toUpperCase();
  const recipient=String(b.recipient||"").trim().toUpperCase();
  const type=String(b.type||"").trim().toLowerCase();
  const content=typeof b.content==="string"?b.content:"";

  if(!idRe.test(sender)||!idRe.test(recipient)) return res.status(400).json({error:"Invalid user ID"});
  if(sender===recipient) return res.status(400).json({error:"You cannot message yourself"});
  if(!types.has(type)) return res.status(400).json({error:"Unsupported message type"});
  if(!content.trim()) return res.status(400).json({error:"Message cannot be empty"});
  if(type==="text" && content.length>4000) return res.status(400).json({error:"Text is too long"});
  if(type==="image" && content.length>12000000) return res.status(400).json({error:"Image is too large"});

  const message={id:crypto.randomUUID(),sender,recipient,type,content,createdAt:Date.now()};
  await saveMessage(message);
  return res.status(201).json({success:true,message});
}