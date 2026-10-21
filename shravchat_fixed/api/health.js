export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  return res.json({success:true,service:"ShravChat",status:"online",version:"1.0.0",timestamp:new Date().toISOString()});
}