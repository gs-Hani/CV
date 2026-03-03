const MY_LINKEDIN = "https://www.linkedin.com/in/hani-alazzawi";
const BITMASK_LENGTH = 64;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Footer Date
    const dateEl = document.getElementById('footer-date');
    if (dateEl) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.innerText = `Last updated: ${new Date().toLocaleDateString(undefined, options)}`;
    }

    // 2. Parse URL Hash
    const hash = decodeURIComponent(window.location.hash.substring(1));
    const params = new URLSearchParams(hash);
    
    let changed = false;
    if (!params.has('p')) { params.set('p', '?'); changed = true; }
    if (!params.has('e')) { params.set('e', '?'); changed = true; }
    if (changed) window.location.hash = params.toString();

    const layoutCode = params.get('c');
    const phone = params.get('p');
    const email = params.get('e');
    const contactDiv = document.getElementById('dynamic-contact');

    // Portfolio Mode is active if real contact info is provided
    const isPortfolioMode = (phone && phone !== '?') || (email && email !== '?');

    if (isPortfolioMode) {
        document.body.classList.add('portfolio-mode');
        renderPortfolioMode(contactDiv, phone, email, layoutCode);
    } else {
        document.body.classList.remove('portfolio-mode');
        initializeEditorMode(params, layoutCode);
    }
});

function renderPortfolioMode(container, phone, email, code) {
    if (code) applyBitmask(code);

    // Trigger CSS to hide the privacy message and show fields
    document.body.classList.add('contacts-loaded');

    const emailEl = document.getElementById('contact-email');
    const phoneEl = document.getElementById('contact-phone');
    const linkedinEl = document.getElementById('contact-linkedin');
    const sep1 = document.getElementById('contact-sep-1');
    const sep2 = document.getElementById('contact-sep-2');

    // Set Email
    if (email && email !== '?') {
        emailEl.href = `mailto:${email}`;
        emailEl.innerText = email;
        if (sep1) sep1.classList.remove('hidden');
    }

    // Set Phone
    if (phone && phone !== '?') {
        phoneEl.innerText = phone;
        if (sep2) sep2.classList.remove('hidden');
    }

    // Set LinkedIn
    if (linkedinEl && MY_LINKEDIN) {
        linkedinEl.href = MY_LINKEDIN;
        linkedinEl.innerText = MY_LINKEDIN.replace(/^https?:\/\//, '');
    }

    // Disable editor clicks in portfolio mode
    document.querySelectorAll('[data-i]').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'default';
    });
}

function initializeEditorMode(params, code) {
    if (code) applyBitmask(code);
    
    document.querySelectorAll('[data-i]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation(); 
            el.classList.toggle('hidden');
            updateURL(params);
        });
    });
}

function updateURL(params) {
    const elements = document.querySelectorAll('[data-i]');
    let bits = new Array(BITMASK_LENGTH).fill("0");
    
    elements.forEach(el => {
        const id = parseInt(el.getAttribute('data-i'));
        if (id >= 0 && id < BITMASK_LENGTH) {
            // If it DOES NOT have the hidden class, it's visible (1)
            bits[id] = el.classList.contains('hidden') ? "0" : "1";
        }
    });

    let binaryString = bits.join("");
    let hexCode = "";
    for (let i = 0; i < binaryString.length; i += 4) {
        hexCode += parseInt(binaryString.substr(i, 4), 2).toString(16);
    }
    
    params.set('c', hexCode);
    window.location.hash = params.toString();
}

function applyBitmask(hex) {
    if (!hex) return;
    let binaryString = "";
    for (let i = 0; i < hex.length; i++) {
        binaryString += parseInt(hex[i], 16).toString(2).padStart(4, "0");
    }

    document.querySelectorAll('[data-i]').forEach((el) => {
        const id = parseInt(el.getAttribute('data-i'));
        if (id >= 0 && id < binaryString.length) {
            if (binaryString[id] === "0") {
                el.classList.add('hidden');
                el.setAttribute('aria-hidden', 'true');
            } else {
                el.classList.remove('hidden');
                el.removeAttribute('aria-hidden');
            }
        }
    });
}
