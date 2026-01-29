// api/chat.js - النسخة المحدثة لـ gemini-2.5-flash
export default async function handler(req, res) {
  // السماح فقط لـ POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method not allowed",
      message: "Only POST requests are allowed" 
    });
  }

  // الحصول على API key
  const key = process.env.GEMINI_KEY;
  
  if (!key) {
    return res.status(500).json({
      error: "Server Configuration Error",
      message: "API key is not configured on the server"
    });
  }

  try {
    // ✅ استخدام gemini-2.5-flash (النموذج المجاني الصحيح)
    const model = "gemini-2.5-flash"; // ⬅️ التغيير هنا
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
    
    // تحضير الطلب - نفس الهيكل يعمل
    const requestBody = {
      contents: req.body.contents || [
        {
          role: "user",
          parts: [{ text: "Hello" }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
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
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // إرسال الطلب إلى Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // معالجة الاستجابة
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      
      // رسائل خطأ محددة للنموذج الجديد
      let errorMessage = "حدث خطأ في معالجة طلبك";
      if (data.error && data.error.message) {
        if (data.error.message.includes("quota")) {
          errorMessage = "تم تجاوز الحد اليومي للطلبات. يرجى المحاولة غداً.";
        } else if (data.error.message.includes("model") || data.error.message.includes("not found")) {
          errorMessage = `النموذج ${model} غير متوفر. جرب gemini-1.5-flash كبديل.`;
        } else if (data.error.message.includes("content")) {
          errorMessage = "الطلب يحتوي على محتوى غير مسموح به.";
        }
      }
      
      return res.status(response.status).json({
        error: "Gemini API Error",
        message: errorMessage,
        details: data.error || data,
        modelUsed: model // إضافة معلومات النموذج المستخدم
      });
    }

    // الاستجابة الناجحة
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Error:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "تعذر الاتصال بخدمة الذكاء الاصطناعي",
      advice: "يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
    });
  }
}
