export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  return res.json({success:true,service:"ShravChat",message:"Use /api/message and /api/inbox"});
}