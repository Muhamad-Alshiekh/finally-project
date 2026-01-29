// api/debug.js
export default async function handler(req, res) {
  const key = process.env.GEMINI_KEY;
  const keyExists = !!key;
  const keyLength = key ? key.length : 0;
  
  // اختبار الاتصال بالـ API مباشرة
  let apiTest = { success: false, error: null };
  
  if (key) {
    try {
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: "Say hello" }]
            }]
          })
        }
      );
      
      const testData = await testResponse.json();
      apiTest = {
        success: testResponse.ok,
        status: testResponse.status,
        data: testData
      };
    } catch (error) {
      apiTest.error = error.message;
    }
  }
  
  return res.status(200).json({
    environment: process.env.NODE_ENV,
    geminiKeyExists: keyExists,
    geminiKeyLength: keyLength,
    geminiKeySample: key ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}` : null,
    allRelevantEnvVars: Object.keys(process.env).filter(k => 
      k.includes('GEMINI') || 
      k.includes('GOOGLE') || 
      k.includes('API') || 
      k.includes('KEY')
    ),
    apiTest: apiTest,
    timestamp: new Date().toISOString()
  });
}