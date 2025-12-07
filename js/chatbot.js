// Chatbot Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'openai/gpt-4o-mini';

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

// Conversation history
let conversationHistory = [];

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    createChatbotUI();
    setupEventListeners();
});

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

// Send message function
async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message to UI
    addMessageToUI(message, 'user');

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call OpenRouter API
        const response = await callOpenRouterAPI(conversationHistory);
        
        // Remove typing indicator
        hideTypingIndicator();

        // Add bot response to UI
        addMessageToUI(response, 'bot');

        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: response
        });

    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessageToUI('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى. / Sorry, an error occurred. Please try again.', 'bot');
    }
}

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

// Call OpenRouter API
async function callOpenRouterAPI(messages) {
    const systemMessage = {
        role: 'system',
        content: buildSystemPrompt()
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Dar al-Kutub Bookstore'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [systemMessage, ...messages]
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
