/**
 * Dar al-Kutub - Professional Authentication System
 * Using localStorage for demo purposes
 */

class AuthSystem {
  constructor() {
    this.storageKey = 'daralkutub_users';
    this.currentUserKey = 'daralkutub_currentUser';
    this.init();
  }

  init() {
    // Initialize users storage if not exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    
    // Check if user is logged in
    this.checkAuthState();
    
    // Bind events
    this.bindEvents();
  }

  // Get all users
  getUsers() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  // Save users
  saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem(this.currentUserKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Set current user
  setCurrentUser(user) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  // Clear current user
  clearCurrentUser() {
    localStorage.removeItem(this.currentUserKey);
  }

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password (min 6 characters)
  validatePassword(password) {
    return password.length >= 6;
  }

  // Hash password (simple hash for demo - use bcrypt in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Register user
  register(email, password, name = '') {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Validate email
        if (!this.validateEmail(email)) {
          reject({ message: 'Please enter a valid email address' });
          return;
        }

        // Validate password
        if (!this.validatePassword(password)) {
          reject({ message: 'Password must be at least 6 characters' });
          return;
        }

        const users = this.getUsers();

        // Check if user exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          reject({ message: 'An account with this email already exists' });
          return;
        }

        // Create new user
        const newUser = {
          id: Date.now(),
          email: email.toLowerCase(),
          password: this.hashPassword(password),
          name: name || email.split('@')[0],
          createdAt: new Date().toISOString(),
          wishlist: [],
          cart: []
        };

        users.push(newUser);
        this.saveUsers(users);

        // Auto login after registration
        const userSession = { ...newUser };
        delete userSession.password;
        this.setCurrentUser(userSession);

        resolve({ 
          success: true, 
          message: 'Account created successfully! Welcome!',
          user: userSession 
        });
      }, 800);
    });
  }

  // Login user
  login(email, password, remember = false) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Validate email
        if (!this.validateEmail(email)) {
          reject({ message: 'Please enter a valid email address' });
          return;
        }

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          reject({ message: 'No account found with this email' });
          return;
        }

        if (user.password !== this.hashPassword(password)) {
          reject({ message: 'Incorrect password. Please try again' });
          return;
        }

        // Create session
        const userSession = { ...user, remember };
        delete userSession.password;
        this.setCurrentUser(userSession);

        resolve({ 
          success: true, 
          message: 'Login successful! Welcome back!',
          user: userSession 
        });
      }, 800);
    });
  }

  // Logout user
  logout() {
    this.clearCurrentUser();
    this.updateUI();
    this.showNotification('You have been logged out successfully', 'success');
  }

  // Check authentication state
  checkAuthState() {
    const user = this.getCurrentUser();
    if (user) {
      this.updateUI(user);
    }
  }

  // Update UI based on auth state
  updateUI(user = null) {
    const userIconContainer = document.querySelector('.user-items .pe-3:has([data-bs-target="#exampleModal"])');
    
    if (!userIconContainer) return;

    if (user) {
      // User is logged in
      const initials = user.name.substring(0, 2).toUpperCase();
      userIconContainer.innerHTML = `
        <div class="dropdown user-logged-in">
          <a href="#" class="dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown" role="button">
            <div class="user-avatar">${initials}</div>
          </a>
          <div class="dropdown-menu user-dropdown-menu dropdown-menu-end animate slide">
            <div class="px-3 py-2 border-bottom">
              <strong>${user.name}</strong>
              <small class="d-block text-muted">${user.email}</small>
            </div>
            <a class="dropdown-item" href="#">
              <svg width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
              </svg>
              My Account
            </a>
            <a class="dropdown-item" href="#">
              <svg width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              My Orders
            </a>
            <a class="dropdown-item" href="#">
              <svg width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
              Wishlist
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item text-danger" href="#" id="logoutBtn">
              <svg width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              Logout
            </a>
          </div>
        </div>
      `;

      // Bind logout event
      document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    } else {
      // User is not logged in - restore original icon
      userIconContainer.innerHTML = `
        <a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">
          <svg class="user" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="evenodd" d="M12 1.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5M8.75 6a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M12 12.25c-2.313 0-4.445.526-6.024 1.414C4.42 14.54 3.25 15.866 3.25 17.5v.102c-.001 1.162-.002 2.62 1.277 3.662c.629.512 1.51.877 2.7 1.117c1.192.242 2.747.369 4.773.369s3.58-.127 4.774-.369c1.19-.24 2.07-.605 2.7-1.117c1.279-1.042 1.277-2.5 1.276-3.662V17.5c0-1.634-1.17-2.96-2.725-3.836c-1.58-.888-3.711-1.414-6.025-1.414M4.75 17.5c0-.851.622-1.775 1.961-2.528c1.316-.74 3.184-1.222 5.29-1.222c2.104 0 3.972.482 5.288 1.222c1.34.753 1.961 1.677 1.961 2.528c0 1.308-.04 2.044-.724 2.6c-.37.302-.99.597-2.05.811c-1.057.214-2.502.339-4.476.339c-1.974 0-3.42-.125-4.476-.339c-1.06-.214-1.68-.509-2.05-.81c-.684-.557-.724-1.293-.724-2.601" clip-rule="evenodd"/>
          </svg>
        </a>
        <!-- Modal will be re-initialized -->
      `;
    }
  }

  // Show notification
  showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.auth-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#2E8B57' : '#dc3545'};
      color: white;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 999999;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Bind form events
  bindEvents() {
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      this.bindLoginForm();
      this.bindRegisterForm();
    });

    // Also try immediately if DOM already loaded
    if (document.readyState !== 'loading') {
      this.bindLoginForm();
      this.bindRegisterForm();
    }
  }

  bindLoginForm() {
    const loginForm = document.querySelector('#nav-sign-in');
    if (!loginForm) return;

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Remove existing listeners by cloning
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const emailInput = loginForm.querySelector('input[name="username"]');
      const passwordInput = loginForm.querySelector('input[name="password"]');
      const rememberInput = loginForm.querySelector('input[type="checkbox"]');

      const email = emailInput?.value?.trim();
      const password = passwordInput?.value;
      const remember = rememberInput?.checked || false;

      if (!email || !password) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }

      // Show loading
      newBtn.innerHTML = '<span class="auth-spinner"></span> Logging in...';
      newBtn.classList.add('loading');

      try {
        const result = await this.login(email, password, remember);
        this.showNotification(result.message, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal?.hide();

        // Update UI
        this.updateUI(result.user);

        // Clear form
        emailInput.value = '';
        passwordInput.value = '';

      } catch (error) {
        this.showNotification(error.message, 'error');
      } finally {
        newBtn.innerHTML = 'Login';
        newBtn.classList.remove('loading');
      }
    });
  }

  bindRegisterForm() {
    const registerForm = document.querySelector('#nav-register');
    if (!registerForm) return;

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Remove existing listeners by cloning
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const emailInput = registerForm.querySelector('input[name="username"]');
      const passwordInput = registerForm.querySelector('input[name="password"]');
      const agreeInput = registerForm.querySelector('input[type="checkbox"]');

      const email = emailInput?.value?.trim();
      const password = passwordInput?.value;
      const agreed = agreeInput?.checked || false;

      if (!email || !password) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }

      if (!agreed) {
        this.showNotification('Please agree to the Privacy Policy', 'error');
        return;
      }

      // Show loading
      newBtn.innerHTML = '<span class="auth-spinner"></span> Creating account...';
      newBtn.classList.add('loading');

      try {
        const result = await this.register(email, password);
        this.showNotification(result.message, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal?.hide();

        // Update UI
        this.updateUI(result.user);

        // Clear form
        emailInput.value = '';
        passwordInput.value = '';

      } catch (error) {
        this.showNotification(error.message, 'error');
      } finally {
        newBtn.innerHTML = 'Register';
        newBtn.classList.remove('loading');
      }
    });
  }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  .auth-notification .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .auth-notification .notification-icon {
    font-size: 18px;
  }
`;
document.head.appendChild(style);

// Initialize Auth System
const auth = new AuthSystem();

// Export for global access
window.DarAlKutubAuth = auth;
