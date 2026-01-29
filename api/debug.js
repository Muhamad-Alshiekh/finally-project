// api/debug.js - المحدث
export default async function handler(req, res) {
  const key = process.env.GEMINI_KEY;
  const keyExists = !!key;
  const keyLength = key ? key.length : 0;
  
  // ✅ اختبار نموذج gemini-2.5-flash
  const model = "gemini-2.5-flash";
  let apiTest = { success: false, error: null, model: model };
  
  if (key) {
    try {
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: "Say hello in Arabic" }]
            }]
          })
        }
      );
      
      const testData = await testResponse.json();
      apiTest = {
        success: testResponse.ok,
        status: testResponse.status,
        model: model,
        data: testData,
        responseText: testResponse.ok ? testData?.candidates?.[0]?.content?.parts?.[0]?.text : null
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
    timestamp: new Date().toISOString(),
    note: `Testing model: ${model}`
  });
}
