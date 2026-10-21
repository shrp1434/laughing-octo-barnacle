export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name || name.length > 30) return res.status(400).json({error:"Name must be 1–30 characters"});

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = n => Array.from({length:n}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  const id = `SHRV-${part(4)}-${part(4)}`;

  return res.status(201).json({
    success:true,
    user:{id,name}
  });
}