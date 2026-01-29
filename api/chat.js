export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_KEY;

  try {
    // تم التغيير من v1beta إلى v1 واستخدام الموديل المستقر
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Google API Error", 
        message: data.error?.message || "Check your API Key and Model compatibility",
        details: data 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Vercel Crash", details: err.message });
  }
}
