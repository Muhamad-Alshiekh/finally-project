// Chatbot Configuration - gemini (gemini R1)
// Chatbot Configuration
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
        { id: 1, title: "Arabian Nights", titleAr: "ألف ليلة وليلة", author: "Various Authors", price: "45 AED", originalPrice: "60 AED", discount: "25% OFF", category: "Fiction", rating: 4.8, status: "bestseller" },
        { id: 2, title: "Desert Rose Recipes", titleAr: "وصفات وردة الصحراء", author: "Fatima Al-Mansouri", price: "65 AED", category: "Cooking", rating: 4.5, status: "new" },
        { id: 3, title: "Love in Dubai", titleAr: "حب في دبي", author: "Ahmed Hassan", price: "55 AED", originalPrice: "75 AED", discount: "30% OFF", category: "Romance", rating: 4.3, status: "on-sale" },
        { id: 4, title: "Healthy Arabian Lifestyle", titleAr: "نمط الحياة العربي الصحي", author: "Dr. Layla Mohammed", price: "80 AED", category: "Health", rating: 4.7, status: "bestseller" },
        { id: 5, title: "The Oasis Mystery", titleAr: "لغز الواحة", author: "Khalid Al-Farsi", price: "50 AED", category: "Thriller", rating: 4.6, status: "new" },
        { id: 6, title: "Stars of the Desert", titleAr: "نجوم الصحراء", author: "Sarah Al-Jabri", price: "70 AED", originalPrice: "95 AED", discount: "30% OFF", category: "Sci-fi", rating: 4.4, status: "on-sale" },
        { id: 7, title: "Emirati Cuisine Mastery", titleAr: "إتقان المطبخ الإماراتي", author: "Mariam Al-Ketbi", price: "90 AED", category: "Recipe", rating: 4.9, status: "bestseller" },
        { id: 8, title: "Modern Arabian Living", titleAr: "العيش العربي الحديث", author: "Omar Rashid", price: "60 AED", category: "Lifestyle", rating: 4.2, status: "new" }
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

document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
});

function buildSystemPrompt() {
    const booksInfo = STORE_DATA.books.map(book => {
        let info = `- "${book.title}" (${book.titleAr}) - ${book.author} - ${book.price}`;
        if (book.discount) info += ` ${book.discount}`;
        return info;
    }).join('\n');

    return `أنت مساعد مكتبة ${STORE_DATA.storeName}. تحدث مع العملاء بالعربية أو الإنجليزية.
الكتب المتوفرة:
${booksInfo}
ساعد العملاء في البحث والتوصية بالعروض.`;
}

// الدالة المسؤولة عن الاتصال بـ Vercel Backend
async function callGeminiAPI(userMessage) {
    const systemPrompt = buildSystemPrompt();

    const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content || '') }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: String(userMessage || '') }]
    });

    // نرسل الطلب إلى رابط الـ API الداخلي في Vercel
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "خطأ في الاتصال بالسيرفر");
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text || "عذراً، لم أستطع فهم ذلك.";
}

// (باقي دوال الـ UI مثل sendMessage و createChatbotUI تبقى كما هي بدون تغيير)
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();

    if (!message || isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;
    input.disabled = true;
    
    const userMessage = message;
    input.value = '';
    addMessageToUI(userMessage, 'user');
    showTypingIndicator();

    try {
        const response = await callGeminiAPI(userMessage);
        hideTypingIndicator();
        addMessageToUI(response, 'bot');

        conversationHistory.push({ role: 'user', content: userMessage });
        conversationHistory.push({ role: 'assistant', content: response });

        if (conversationHistory.length > 6) conversationHistory = conversationHistory.slice(-6);
    } catch (error) {
        hideTypingIndicator();
        addMessageToUI("عذراً، حدث خطأ في النظام. تأكد من إعداد المفتاح في Vercel.", 'bot');
        console.error('Chatbot error:', error);
    }

    isProcessing = false;
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
}

function createChatbotUI() {
    const chatbotHTML = `
    <button id="chatbot-toggle" class="chatbot-toggle">💬</button>
    <div id="chatbot-container" class="chatbot-container">
        <div class="chatbot-header">
            <h4>Dar al-Kutub Assistant</h4>
            <button id="chatbot-close">×</button>
        </div>
        <div id="chatbot-messages" class="chatbot-messages"></div>
        <div class="chatbot-input-container">
            <input type="text" id="chatbot-input" placeholder="Type a message...">
            <button id="chatbot-send">➤</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

function setupEventListeners() {
    const container = document.getElementById('chatbot-container');
    document.getElementById('chatbot-toggle').onclick = () => container.classList.add('active');
    document.getElementById('chatbot-close').onclick = () => container.classList.remove('active');
    document.getElementById('chatbot-send').onclick = sendMessage;
    document.getElementById('chatbot-input').onkeypress = (e) => e.key === 'Enter' && sendMessage();
}

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
    div.innerHTML = `<div class="message-content">...جاري التفكير</div>`;
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

