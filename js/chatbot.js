// بيانات المتجر والكتب - تم الحفاظ عليها بالكامل من كودك الأصلي
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

document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
});

// بناء التعليمات للـ AI بناءً على بيانات المتجر
function buildSystemPrompt() {
    const booksInfo = STORE_DATA.books.map(book => {
        let info = `- "${book.title}" by ${book.author}, Price: ${book.price}`;
        if (book.discount) info += ` (${book.discount})`;
        return info;
    }).join('\n');

    return `You are a helpful assistant for "${STORE_DATA.storeName}". 
    Store Info: Phone ${STORE_DATA.storeInfo.phone}, Address: ${STORE_DATA.storeInfo.address}.
    Available Books:
    ${booksInfo}
    Guidelines: 
    1. Recommend books ONLY from the list above. 
    2. Answer in Arabic or English based on the user. 
    3. Be concise.`;
}

// الدالة الجديدة للاتصال بـ Vercel (بدون الحاجة لمفاتيح هنا)
async function callGeminiAPI(userMessage) {
    const systemPrompt = buildSystemPrompt();

    // تجهيز السجل بصيغة Gemini
    const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content || '') }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: String(userMessage || '') }]
    });

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Server Error");
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

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
        console.error(error);
        hideTypingIndicator();
        addMessageToUI("عذراً، حدث خطأ في النظام. حاول مجدداً.", "bot");
    }

    isProcessing = false;
    sendBtn.disabled = false;
    input.focus();
}

// --- وظائف الـ UI (بقيت كما هي لتناسب تصميمك) ---

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
                        <p>مرحباً! أنا مساعد دار الكتب 📚 كيف يمكنني مساعدتك اليوم؟</p>
                    </div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="Type your message..." autocomplete="off">
                <button id="chatbot-send">➤</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

function setupEventListeners() {
    const container = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    
    toggle.onclick = () => { container.classList.add('active'); toggle.style.display = 'none'; };
    document.getElementById('chatbot-close').onclick = () => { container.classList.remove('active'); toggle.style.display = 'flex'; };
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
