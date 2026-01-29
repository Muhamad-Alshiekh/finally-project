// api/chat.js - النسخة المعدلة
export default async function handler(req, res) {
  // السماح فقط لـ POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method not allowed",
      allowed: ["POST"] 
    });
  }

  // الحصول على API key من environment variable
  const key = process.env.GEMINI_KEY;
  
  // إذا لم يكن هناك مفتاح
  if (!key) {
    console.error("❌ GEMINI_KEY is not set in environment variables");
    return res.status(401).json({
      error: "Missing API Key",
      message: "GEMINI_KEY environment variable is not set",
      instructions: [
        "1. Go to your Vercel project dashboard",
        "2. Navigate to Settings > Environment Variables",
        "3. Add a new variable named GEMINI_KEY",
        "4. Paste your Google Gemini API key",
        "5. Redeploy your application"
      ]
    });
  }

  // تحقق من أن المفتاح ليس القيمة الافتراضية
  if (key === "YOUR_API_KEY_HERE" || key.length < 20) {
    return res.status(401).json({
      error: "Invalid API Key Format",
      message: "API key appears to be a placeholder or too short",
      keyLength: key.length
    });
  }

  try {
    // استخدم الإصدار المستقر من Gemini
    const model = "gemini-1.5-flash"; // أو جرب "gemini-pro"
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
    
    console.log(`🔍 Calling Gemini API with model: ${model}`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: req.body.contents || [
          {
            role: "user",
            parts: [{ text: "Hello" }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    
    // سجل الاستجابة للتصحيح
    console.log(`📡 Gemini API Status: ${response.status}`);
    
    if (!response.ok) {
      console.error("❌ Gemini API Error:", JSON.stringify(data, null, 2));
      
      // رسائل خطأ محددة
      let userMessage = "API request failed";
      
      if (data.error && data.error.message) {
        if (data.error.message.includes("API key")) {
          userMessage = "Invalid API key. Please check your GEMINI_KEY environment variable.";
        } else if (data.error.message.includes("quota")) {
          userMessage = "API quota exceeded. Please check your Google Cloud billing.";
        } else if (data.error.message.includes("model")) {
          userMessage = "Model not found. Trying alternative...";
        } else {
          userMessage = data.error.message;
        }
      }
      
      return res.status(response.status).json({
        error: "Google Gemini API Error",
        message: userMessage,
        details: data.error || data,
        debug: {
          modelUsed: model,
          keyLength: key.length,
          keyPrefix: key.substring(0, 5)
        }
      });
    }

    // الاستجابة الناجحة
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("💥 Server Error:", error);
    
    return res.status(500).json({
      error: "Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      advice: "Check your network connection and API key permissions"
    });
  }
}
