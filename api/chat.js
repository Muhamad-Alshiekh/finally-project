export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body) // هذا هو المتهم الأول
      }
    );

    const data = await response.json();

    // إذا جوجل أرسلت خطأ، سنرسله للمتصفح لنعرف ما هو
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Google API Error", 
        message: data.error?.message || "Unknown Google Error",
        details: data 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Vercel Crash", details: err.message });
  }
}
