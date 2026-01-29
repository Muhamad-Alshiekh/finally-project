// Chatbot Configuration - gemini (gemini R1)
const GEMINI_API_KEY = 'AIzaSyAUVhDOcIeL1NvhR7lJndGxxSTs8Ns7iqs';
const GEMINI_API_KEY_STORAGE_KEY = 'daralkutub_gemini_api_key';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash-latest';

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

// Flag to prevent multiple simultaneous requests
let isProcessing = false;

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
});
// Build system prompt with store knowledge
function buildSystemPrompt() {
    const booksInfo = STORE_DATA.books.map(book => {
        let info = `- "${book.title}" by ${book.author}, Price: ${book.price}`;
        if (book.discount) info += ` (${book.discount})`;
        if (book.originalPrice) info += ` (was ${book.originalPrice})`;
        info += `, Category: ${book.category}, Rating: ${book.rating}/5`;
        if (book.status === 'bestseller') info += ' [BESTSELLER]';
        if (book.status === 'new') info += ' [NEW]';
        if (book.status === 'on-sale') info += ' [ON SALE]';
        return info;
    }).join('\n');

    const categoriesInfo = STORE_DATA.categories.map(c => `- ${c.name} (${c.nameAr})`).join('\n');

    return `You are a helpful and knowledgeable assistant for "${STORE_DATA.storeName}", a traditional bookstore.

=== STORE INFORMATION ===
Phone: ${STORE_DATA.storeInfo.phone}
Email: ${STORE_DATA.storeInfo.email}
Address: ${STORE_DATA.storeInfo.address}
Shipping: ${STORE_DATA.storeInfo.shipping}
Current Offer: ${STORE_DATA.storeInfo.currentOffer}
Limited Time Offer: ${STORE_DATA.storeInfo.limitedOffer}

=== BOOK CATEGORIES ===
${categoriesInfo}

=== OUR BOOKS COLLECTION ===
${booksInfo}

=== YOUR ROLE ===
1. Help customers find books based on their interests, mood, or preferences
2. Recommend books from our collection based on category, author, or price
3. Provide information about current discounts and offers
4. Answer questions about shipping, contact info, and store policies
5. Suggest bestsellers, new arrivals, or books on sale when appropriate

=== GUIDELINES ===
- Always recommend books FROM OUR COLLECTION listed above
- Be friendly, helpful, and enthusiastic about books
- Respond in the same language the customer uses (Arabic or English)
- Keep responses concise but informative
- When recommending, mention price, author, and any current discounts
- If asked about a book we don't have, politely suggest similar books from our collection`;
}

function resolveGeminiApiKey() {
    const fromWindow = (window.GEMINI_API_KEY && String(window.GEMINI_API_KEY).trim()) || '';
    if (fromWindow) return fromWindow;

    try {
        const fromStorage = (localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || '').trim();
        if (fromStorage) return fromStorage;
    } catch (e) {
        // Ignore storage access errors
    }

    return (GEMINI_API_KEY || '').trim();
}

function getGeminiModelFallbackList() {
    const models = [
        (GEMINI_MODEL || '').trim(),
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro',
        'gemini-pro'
    ].filter(Boolean);

    return Array.from(new Set(models));
}

// Call Google Gemini API (generateContent)
async function callGeminiAPI(userMessage) {
    const apiKey = resolveGeminiApiKey();
    if (!apiKey) {
        throw new Error(
            'Gemini API key is not configured. Set window.GEMINI_API_KEY or localStorage["daralkutub_gemini_api_key"].'
        );
    }

    const systemPrompt = buildSystemPrompt();

    const contents = [];

    // Add conversation history
    conversationHistory.forEach(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
            role,
            parts: [{ text: String(msg.content || '') }]
        });
    });

    // Add current user message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const requestBody = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    const modelsToTry = getGeminiModelFallbackList();
    let lastError;

    for (const model of modelsToTry) {
        const url = `${GEMINI_BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            const msg = data?.error?.message || `API error: ${response.status}`;
            lastError = new Error(msg);

            const looksLikeModelNotFound =
                response.status === 404 &&
                typeof msg === 'string' &&
                (msg.includes('not found') || msg.includes('not supported'));

            if (looksLikeModelNotFound) {
                continue;
            }

            console.error('Gemini API Error:', data);
            throw lastError;
        }

        const text = data?.candidates?.[0]?.content?.parts
            ?.map(p => p?.text)
            ?.filter(Boolean)
            ?.join('\n');

        if (text) return text;

        lastError = new Error('Invalid response from Gemini API');
    }

    throw lastError || new Error('No supported Gemini model found for this API key/project');
}

// Send message function
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();

    if (!message) return;
    if (isProcessing) {
        console.log('Still processing previous message...');
        return;
    }

    // Set processing flag
    isProcessing = true;
    
    try {
        sendBtn.disabled = true;
        input.disabled = true;

        // Clear input
        input.value = '';

        // Add user message to UI
        addMessageToUI(message, 'user');

        // Show typing indicator
        showTypingIndicator();

        // Call Gemini API
        const response = await callGeminiAPI(message);
        
        // Remove typing indicator
        hideTypingIndicator();

        // Add bot response to UI
        addMessageToUI(response, 'bot');

        // Add to conversation history
        conversationHistory.push({
            role: 'user',
            content: message
        });
        conversationHistory.push({
            role: 'assistant',
            content: response
        });

    } catch (error) {
        console.error('Chatbot Error:', error);
        hideTypingIndicator();
        const errorMsg = error.message || 'Unknown error';
        addMessageToUI(`عذراً، حدث خطأ: ${errorMsg} / Sorry, error: ${errorMsg}`, 'bot');
    }
    
    // Always reset - outside try/catch to ensure it runs
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
