// Chatbot Configuration - gemini (gemini R1)
const HF_TOKEN = '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';
const HF_TOKEN_STORAGE_KEY = 'daralkutub_hf_token';
const HF_INFERENCE_BASE_URL = 'https://api-inference.huggingface.co/models';
const HF_DEFAULT_MODEL_ID = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0';

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
        {
            id: 1,
            title: "Arabian Nights",
            titleAr: "ألف ليلة وليلة",
            author: "Various Authors",
            price: "45 AED",
            originalPrice: "60 AED",
            discount: "25% OFF",
            category: "Fiction",
            rating: 4.8,
            status: "bestseller"
        },
        {
            id: 2,
            title: "Desert Rose Recipes",
            titleAr: "وصفات وردة الصحراء",
            author: "Fatima Al-Mansouri",
            price: "65 AED",
            category: "Cooking",
            rating: 4.5,
            status: "new"
        },
        {
            id: 3,
            title: "Love in Dubai",
            titleAr: "حب في دبي",
            author: "Ahmed Hassan",
            price: "55 AED",
            originalPrice: "75 AED",
            discount: "30% OFF",
            category: "Romance",
            rating: 4.3,
            status: "on-sale"
        },
        {
            id: 4,
            title: "Healthy Arabian Lifestyle",
            titleAr: "نمط الحياة العربي الصحي",
            author: "Dr. Layla Mohammed",
            price: "80 AED",
            category: "Health",
            rating: 4.7,
            status: "bestseller"
        },
        {
            id: 5,
            title: "The Oasis Mystery",
            titleAr: "لغز الواحة",
            author: "Khalid Al-Farsi",
            price: "50 AED",
            category: "Thriller",
            rating: 4.6,
            status: "new"
        },
        {
            id: 6,
            title: "Stars of the Desert",
            titleAr: "نجوم الصحراء",
            author: "Sarah Al-Jabri",
            price: "70 AED",
            originalPrice: "95 AED",
            discount: "30% OFF",
            category: "Sci-fi",
            rating: 4.4,
            status: "on-sale"
        },
        {
            id: 7,
            title: "Emirati Cuisine Mastery",
            titleAr: "إتقان المطبخ الإماراتي",
            author: "Mariam Al-Ketbi",
            price: "90 AED",
            category: "Recipe",
            rating: 4.9,
            status: "bestseller"
        },
        {
            id: 8,
            title: "Modern Arabian Living",
            titleAr: "العيش العربي الحديث",
            author: "Omar Rashid",
            price: "60 AED",
            category: "Lifestyle",
            rating: 4.2,
            status: "new"
        }
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
// Conversation history
let conversationHistory = [];
let isProcessing = false;

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
});

// Build system prompt
function buildSystemPrompt() {
    const booksInfo = STORE_DATA.books.map(book => {
        let info = `- "${book.title}" (${book.titleAr}) - ${book.author} - ${book.price}`;
        if (book.discount) info += ` ${book.discount}`;
        return info;
    }).join('\n');

    return `أنت مساعد مكتبة ${STORE_DATA.storeName}. تحدث مع العملاء بالعربية أو الإنجليزية.
المتجر: ${STORE_DATA.storeName}
الهاتف: ${STORE_DATA.storeInfo.phone}
العنوان: ${STORE_DATA.storeInfo.address}
العرض: ${STORE_DATA.storeInfo.currentOffer}

الكتب المتوفرة:
${booksInfo}

ساعد العملاء في:
1. البحث عن كتب
2. معرفة العروض
3. معلومات الشحن
4. التوصية بكتب`;
}

function resolveHuggingFaceToken() {
    const fromWindow = (window.HF_TOKEN && String(window.HF_TOKEN).trim()) || '';
    if (fromWindow) return fromWindow;

    try {
        const fromStorage = (localStorage.getItem(HF_TOKEN_STORAGE_KEY) || '').trim();
        if (fromStorage) return fromStorage;
    } catch (e) {
        // Ignore storage access errors
    }

    return (HF_TOKEN || '').trim();
}

function getHuggingFaceModelFallbackList() {
    const models = [
        (HF_DEFAULT_MODEL_ID || '').trim(),
        'google/gemma-2-2b-it',
        'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
        'google/flan-t5-base',
        'google/flan-t5-small'
    ].filter(Boolean);

    return Array.from(new Set(models));
}

function buildChatPrompt(systemPrompt, userMessage) {
    let prompt = `${systemPrompt}\n\n`;

    conversationHistory.forEach(msg => {
        const label = msg.role === 'assistant' ? 'المساعد' : 'العميل';
        prompt += `${label}: ${String(msg.content || '')}\n`;
    });

    prompt += `العميل: ${userMessage}\nالمساعد:`;
    return prompt;
}

async function callHuggingFaceAPI(userMessage) {
    const token = resolveHuggingFaceToken();
    if (!token) {
        throw new Error('HF token not configured. Set window.HF_TOKEN or localStorage["daralkutub_hf_token"].');
    }

    const systemPrompt = buildSystemPrompt();
    const prompt = buildChatPrompt(systemPrompt, userMessage);
    const modelsToTry = getHuggingFaceModelFallbackList();
    let lastError;

    for (const modelId of modelsToTry) {
        const url = `${HF_INFERENCE_BASE_URL}/${encodeURIComponent(modelId)}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    return_full_text: false
                },
                options: {
                    wait_for_model: true
                }
            })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            const msg = (data && (data.error || data.message)) ? String(data.error || data.message) : `HTTP ${res.status}`;
            lastError = new Error(msg);

            const retryableModelIssue =
                res.status === 404 ||
                res.status === 403 ||
                res.status === 503 ||
                (typeof msg === 'string' &&
                    (msg.includes('is currently loading') ||
                        msg.includes('not found') ||
                        msg.includes('does not exist') ||
                        msg.includes('gated') ||
                        msg.includes('permission')));

            if (retryableModelIssue) {
                continue;
            }

            throw lastError;
        }

        const text = Array.isArray(data)
            ? (data[0]?.generated_text || data[0]?.summary_text)
            : (data?.generated_text || data?.summary_text);

        if (text) return String(text);

        lastError = new Error('Invalid HuggingFace response format');
    }

    throw lastError || new Error('No available HuggingFace model could answer (try a different model or check token permissions).');
}

// Send message function
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();

    if (!message) return;
    if (isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;
    input.disabled = true;
    
    // حفظ الرسالة
    const userMessage = message;
    input.value = '';
    
    // إظهار رسالة المستخدم
    addMessageToUI(userMessage, 'user');
    showTypingIndicator();
    
    try {
        // استدعاء HuggingFace API
        const response = await callHuggingFaceAPI(userMessage);
        
        hideTypingIndicator();
        addMessageToUI(response, 'bot');
        
        // حفظ المحادثة
        conversationHistory.push({ role: 'user', content: userMessage });
        conversationHistory.push({ role: 'assistant', content: response });
        
        // الاحتفاظ بآخر 4 رسائل فقط
        if (conversationHistory.length > 4) {
            conversationHistory = conversationHistory.slice(-4);
        }
        
    } catch (error) {
        hideTypingIndicator();
        addMessageToUI("عذراً، جاري الصيانة. جرب سؤالاً بسيطاً مثل 'ما هي الكتب المتوفرة؟'", 'bot');
        console.log('Chatbot error (not important for demo):', error.message);
    }
    
    isProcessing = false;
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
}
// Create chatbot UI elements
function createChatbotUI() {
    const chatbotHTML = `
        <!-- Chatbot Toggle Button -->
        <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>

        <!-- Chatbot Container -->
        <div id="chatbot-container" class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 8V4H8"></path>
                            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                            <path d="M2 14h2"></path>
                            <path d="M20 14h2"></path>
                            <path d="M15 13v2"></path>
                            <path d="M9 13v2"></path>
                        </svg>
                    </div>
                    <div>
                        <h4>Dar al-Kutub Assistant</h4>
                        <span class="chatbot-status">Online</span>
                    </div>
                </div>
                <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
                <div class="chat-message bot-message">
                    <div class="message-content">
                        <p>مرحباً! أنا مساعد دار الكتب 📚</p>
                        <p>يمكنني مساعدتك في:</p>
                        <p>• اقتراح كتب حسب اهتماماتك</p>
                        <p>• معرفة العروض والخصومات</p>
                        <p>• معلومات الشحن والتواصل</p>
                        <p style="margin-top:8px;">Hello! I'm your Dar al-Kutub assistant. Ask me about book recommendations, current offers, or store info!</p>
                    </div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Type your message..." autocomplete="off">
                <button id="chatbot-send" class="chatbot-send" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Append chatbot to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

// Setup event listeners
function setupEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const container = document.getElementById('chatbot-container');

    // Toggle chatbot
    toggleBtn.addEventListener('click', function() {
        container.classList.add('active');
        toggleBtn.style.display = 'none';
        input.focus();
    });

    // Close chatbot
    closeBtn.addEventListener('click', function() {
        container.classList.remove('active');
        toggleBtn.style.display = 'flex';
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Add message to UI
function addMessageToUI(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
