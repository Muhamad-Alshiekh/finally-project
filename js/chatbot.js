// Store Data - Books Catalog
const STORE_DATA = {
    storeName: "Dar al-Kutub (دار الكتب)",
    categories: [
        { name: "Romance", nameAr: "رومانسية" },
        { name: "Lifestyle", nameAr: "أسلوب الحياة" },
        { name: "Recipe", nameAr: "وصفات الطبخ" },
        { name: "Thriller", nameAr: "إثارة" },
        { name: "Sci-fi", nameAr: "خيال علمي" },
        { name: "Cooking", nameAr: "طبخ" },
        { name: "Health", nameAr: "صحة" },
        { name: "Fiction", nameAr: "روايات" }
    ],
    books: [
        { title: "House of Sky Breath", author: "Lauren Asher", price: "$870", discount: "10% off", rating: 5, category: "Romance", status: "bestseller" },
        { title: "Heartland Stars", author: "Lauren Asher", price: "$650", rating: 5, category: "Romance", status: "bestseller" },
        { title: "Heavenly Bodies", author: "Lauren Asher", price: "$720", rating: 5, category: "Romance", status: "bestseller" },
        { title: "His Saving Grace", author: "Lauren Asher", price: "$540", discount: "15% off", rating: 5, category: "Romance", status: "bestseller" },
        { title: "My Dearest Darkest", author: "Lauren Asher", price: "$890", rating: 5, category: "Thriller", status: "bestseller" },
        { title: "The Story of Success", author: "Lauren Asher", price: "$760", rating: 5, category: "Lifestyle", status: "new" },
        { title: "Echoes of the Ancients", author: "Sarah Mitchell", price: "$580", rating: 4.5, category: "Fiction", status: "featured" },
        { title: "The Midnight Garden", author: "Emily Rose", price: "$420", discount: "20% off", rating: 5, category: "Fiction", status: "featured" },
        { title: "Shadow of the Serpent", author: "Lauren Asher", price: "$870", rating: 5, category: "Thriller", status: "featured" },
        { title: "Whispering Winds", author: "Lauren Asher", price: "$870", rating: 5, category: "Fiction", status: "latest" },
        { title: "The Forgotten Realm", author: "Lauren Asher", price: "$870", rating: 5, category: "Fiction", status: "latest" },
        { title: "Moonlit Secrets", author: "Lauren Asher", price: "$870", rating: 5, category: "Romance", status: "latest" },
        { title: "The Crystal Key", author: "Lauren Asher", price: "$870", rating: 5, category: "Fiction", status: "best-reviewed" },
        { title: "Starlight Sonata", author: "Lauren Asher", price: "$870", rating: 5, category: "Romance", status: "best-reviewed" },
        { title: "Tales of the Enchanted Forest", author: "Lauren Asher", price: "$870", rating: 5, category: "Fiction", status: "best-reviewed" },
        { title: "The Phoenix Chronicles", author: "Lauren Asher", price: "$999", originalPrice: "$1666", rating: 5, category: "Fiction", status: "on-sale" },
        { title: "Dreams of Avalon", author: "Lauren Asher", price: "$410", originalPrice: "$500", rating: 5, category: "Fiction", status: "on-sale" },
        { title: "Legends of the Dragon Isles", author: "Lauren Asher", price: "$500", originalPrice: "$600", rating: 5, category: "Fiction", status: "on-sale" },
        { title: "The Emerald Crown", author: "Unknown", price: "$2000", rating: 5, category: "Fiction", status: "wishlist" },
        { title: "The Last Enchantment", author: "Unknown", price: "$400", rating: 5, category: "Fiction", status: "wishlist" },
        { title: "Secrets of the Alchemist", author: "Unknown", price: "$870", rating: 5, category: "Fiction", status: "cart" },
        { title: "Quest for the Lost City", author: "Unknown", price: "$600", rating: 5, category: "Fiction", status: "cart" }
    ],
    storeInfo: {
        phone: "+971 4 123 4567",
        email: "info@daralkutub.com",
        address: "123 Book Street, Literary District, Dubai, UAE",
        shipping: "2-3 business days delivery & free returns",
        currentOffer: "Summer sale discount 60% off!",
        limitedOffer: "30% Discount on all items"
    }
};


let conversationHistory = [];
let isProcessing = false;

// ✅ دالة للتحقق من النموذج (اختياري)
async function checkModelAvailability() {
  try {
    const response = await fetch("/api/debug");
    const data = await response.json();
    
    console.log("Model check result:", {
      model: data.apiTest?.model,
      success: data.apiTest?.success,
      status: data.apiTest?.status
    });
    
    if (data.apiTest?.success) {
      console.log(`✅ النموذج ${data.apiTest.model} يعمل بشكل صحيح`);
    } else {
      console.error(`❌ مشكلة في النموذج: ${data.apiTest?.error || data.apiTest?.data?.error?.message}`);
    }
  } catch (error) {
    console.error("Failed to check model:", error);
  }
}

// ✅ حدث واحد فقط لـ DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
    
    // تحقق من النموذج بعد 1 ثانية
    setTimeout(checkModelAvailability, 1000);
});

// ✅ بناء نظام البrompt
function buildSystemPrompt() {
    const booksInfo = STORE_DATA.books.map(book => `- "${book.title}" by ${book.author}, Price: ${book.price}`).join('\n');
    return `أنت مساعد ذكي لمكتبة "${STORE_DATA.storeName}". 
معلومات التواصل: ${STORE_DATA.storeInfo.phone}.
قائمة الكتب المتاحة حالياً:
${booksInfo}
تعليمات: تحدث بالعربية أو الإنجليزية، كن ودوداً ومختصراً، وركز فقط على الكتب المتوفرة لدينا.`;
}

// ✅ الدالة المعدلة للاتصال بـ Gemini API
async function callGeminiAPI(userMessage) {
    const systemPrompt = `
أنت مساعد ذكي لمكتبة "دار الكتب" 📚

معلومات المكتبة:
- الهاتف: ${STORE_DATA.storeInfo.phone}
- العنوان: ${STORE_DATA.storeInfo.address}
- التوصيل: ${STORE_DATA.storeInfo.shipping}
- العروض الحالية: ${STORE_DATA.storeInfo.currentOffer}

الكتب المتوفرة (${STORE_DATA.books.length} كتاب):
${STORE_DATA.books.slice(0, 10).map(book => `• "${book.title}" - ${book.author} - ${book.price}`).join('\n')}
${STORE_DATA.books.length > 10 ? `و ${STORE_DATA.books.length - 10} كتب أخرى...` : ''}

التعليمات:
1. تحدث بنفس لغة المستخدم (عربي/إنجليزي)
2. كن ودوداً ومفيداً
3. إذا سأل عن كتاب غير موجود، اقترح كتباً مشابهة
4. لا تخترع كتباً غير موجودة في القائمة
5. للإسئلة العامة عن المكتبة، استخدم معلومات التواصل أعلاه
6. للإسئلة التقنية، اطلب الاتصال بـ ${STORE_DATA.storeInfo.phone}`;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ 
                        text: `${systemPrompt}\n\nسؤال العميل: ${userMessage}\n\nالرجاء الرد بلغة العميل:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 800
                }
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("API Response Error:", errorData);
            
            if (res.status === 429) {
                throw new Error("⚠️ الكثير من الطلبات حالياً. يرجى المحاولة بعد قليل.");
            } else if (res.status === 500) {
                throw new Error("🔄 خادم الذكاء الاصطناعي غير متاح حالياً.");
            } else {
                throw new Error("❌ حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.");
            }
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            return "عذراً، لم أتلق رداً مناسباً. هل يمكنك إعادة صياغة سؤالك؟";
        }

        return text;

    } catch (error) {
        console.error("Chatbot API Error:", error);
        
        if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
            return "🌐 تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت لديك.";
        }
        
        return error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
    }
}

// ✅ دالة إرسال الرسالة
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();

    if (!message || isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;
    input.value = '';
    
    addMessageToUI(message, 'user');
    showTypingIndicator();

    try {
        const response = await callGeminiAPI(message);
        hideTypingIndicator();
        addMessageToUI(response, 'bot');

        conversationHistory.push({ role: 'user', content: message });
        conversationHistory.push({ role: 'assistant', content: response });

        if (conversationHistory.length > 6) conversationHistory = conversationHistory.slice(-6);
    } catch (error) {
        hideTypingIndicator();
        addMessageToUI("عذراً، حدث خطأ فني. يرجى التأكد من اتصال الإنترنت أو إعدادات السيرفر.", 'bot');
    }

    isProcessing = false;
    sendBtn.disabled = false;
    input.focus();
}

// ✅ دالة واجهة المستخدم (HTML - نسخة مبسطة)
function createChatbotUI() {
    const chatbotHTML = `
        <button id="chatbot-toggle" class="chatbot-toggle">💬</button>
        <div id="chatbot-container" class="chatbot-container">
            <div class="chatbot-header">
                <h4>Dar al-Kutub Assistant</h4>
                <button id="chatbot-close">×</button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
                 <div class="chat-message bot-message">
                    <div class="message-content">
                        <p>مرحباً بك في دار الكتب! 📚 كيف أساعدك اليوم؟</p>
                    </div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="اكتب رسالتك..." autocomplete="off">
                <button id="chatbot-send">➤</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

// ✅ إعداد الأحداث
function setupEventListeners() {
    const container = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    
    toggle.onclick = () => { container.classList.add('active'); toggle.style.display = 'none'; };
    document.getElementById('chatbot-close').onclick = () => { container.classList.remove('active'); toggle.style.display = 'flex'; };
    document.getElementById('chatbot-send').onclick = sendMessage;
    document.getElementById('chatbot-input').onkeypress = (e) => e.key === 'Enter' && sendMessage();
}

// ✅ باقي الدوال المساعدة
function addMessageToUI(message, sender) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}-message`;
    div.innerHTML = `<div class="message-content"><p>${escapeHtml(message)}</p></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'chat-message bot-message';
    div.innerHTML = `<div class="message-content">...</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

