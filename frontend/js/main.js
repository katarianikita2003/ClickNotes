// Load all JavaScript files
function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
}

// Load scripts in order
loadScript('/js/auth.js');
loadScript('/js/notes.js');

// Utility functions
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Add loader CSS
const loaderStyles = `
    .loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }
    
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = loaderStyles;
document.head.appendChild(styleSheet);

// Enhanced form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

// Show message
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.content') || document.querySelector('.sub');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const nav = document.querySelector('.navigation');
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
    });
    
    nav.appendChild(menuBtn);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Setup mobile menu for smaller screens
    if (window.innerWidth <= 768) {
        setupMobileMenu();
    }
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});