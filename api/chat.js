export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // تم التحديث إلى gemini-1.5-flash لدعم systemInstruction
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await geminiResponse.json();

    // فحص إذا أرجع جوجل خطأ (مثل مفتاح غير صحيح أو صيغة خاطئة)
    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
