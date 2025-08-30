// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth scrolling with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Skill progress animation on scroll
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
};

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach((bar, index) => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                    bar.style.transition = 'width 1.5s ease-out';
                }, 200 + (index * 200)); // Stagger animation
            });
        }
    });
}, observerOptions);

// Observe skills section
const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Contact form submission with validation
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[type="text"]').value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const message = this.querySelector('textarea').value.trim();
    
    // Basic validation
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Store message locally for admin reference
        storeMessage({
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString()
        });
    }, 2000);
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Store contact messages locally
function storeMessage(messageData) {
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.unshift(messageData); // Add to beginning of array
    
    // Keep only last 50 messages
    if (messages.length > 50) {
        messages = messages.slice(0, 50);
    }
    
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// Download CV function
function downloadCV() {
    // Check if CV exists in localStorage
    const cvData = JSON.parse(localStorage.getItem('portfolioData')) || {};
    
    if (cvData.resumeUrl) {
        window.open(cvData.resumeUrl, '_blank');
    } else {
        showNotification('CV download will be available soon! Please contact me directly.', 'info');
        // You can replace this with actual CV file path
        // window.open('path/to/your/cv.pdf', '_blank');
    }
}

// Load and display user data from localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('portfolioData')) || {
        name: 'Gaurav Kumar',
        title: 'BCA Student | AI & Data Science Specialist',
        location: 'Araria, Bihar (PIN: 854311)',
        about: 'I am Gaurav Kumar, a dedicated BCA 2nd year student studying Computer Science & Applications (CSA) at Vivekananda Global University, Jaipur. My specialization is in Artificial Intelligence and Data Science. I am passionate about building a career in technology and programming fields.',
        email: 'gaurav@example.com',
        phone: '+91 XXXXX XXXXX',
        linkedin: '#',
        github: '#',
        twitter: '',
        instagram: '',
        website: '',
        profileImage: 'grv.jpg'
    };

    // Update DOM elements safely
    updateElement('userTitle', userData.title);
    updateElement('userLocation', `📍 ${userData.location}`);
    updateElement('aboutText', userData.about);
    updateElement('contactEmail', userData.email);
    updateElement('contactPhone', userData.phone);
    
    // Update contact location with line break
    const contactLocation = document.getElementById('contactLocation');
    if (contactLocation) {
        contactLocation.innerHTML = userData.location.replace(' (PIN: 854311)', '<br>PIN: 854311');
    }
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    if (profileImage && userData.profileImage) {
        profileImage.src = userData.profileImage;
    }
    
    // Update social media links
    updateLink('linkedinLink', userData.linkedin);
    updateLink('githubLink', userData.github);
    updateLink('emailLink', `mailto:${userData.email}`);
    
    // Update page title
    document.title = `${userData.name} - Portfolio`;
}

// Helper function to safely update elements
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element && content) {
        element.textContent = content;
    }
}

// Helper function to safely update links
function updateLink(id, href) {
    const element = document.getElementById(id);
    if (element && href && href !== '#') {
        element.href = href;
    }
}

// Load dynamic education data
function loadEducationData() {
    const educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    const container = document.getElementById('educationGrid');
    
    if (!container) return;
    
    // Keep existing default cards and add new ones
    educationData.forEach(item => {
        if (item.isCustom) { // Only add custom education items
            const educationCard = createEducationCard(item);
            container.appendChild(educationCard);
        }
    });
}

// Create education card element
function createEducationCard(item) {
    const card = document.createElement('div');
    card.className = 'education-card';
    card.innerHTML = `
        <div class="education-image">
            <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop'}" alt="${item.degree}">
        </div>
        <h3>${item.degree}</h3>
        <h4>${item.institution || ''}</h4>
        ${item.specialization ? `<p><strong>Specialization:</strong> ${item.specialization}</p>` : ''}
        ${item.percentage ? `<p><strong>Grade:</strong> ${item.percentage}</p>` : ''}
        ${item.year ? `<p><strong>Year:</strong> ${item.year}</p>` : ''}
        <span class="status ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
    `;
    return card;
}

// Load dynamic skills data
function loadSkillsData() {
    const skillsData = JSON.parse(localStorage.getItem('skillsData')) || [];
    const skillsGrid = document.querySelector('.skills-grid');
    
    if (!skillsGrid || skillsData.length === 0) return;
    
    // Group skills by category
    const groupedSkills = {};
    skillsData.forEach(skill => {
        if (!groupedSkills[skill.category]) {
            groupedSkills[skill.category] = [];
        }
        groupedSkills[skill.category].push(skill);
    });
    
    // Add new skill categories
    Object.keys(groupedSkills).forEach(category => {
        const existingCategory = document.querySelector(`[data-category="${category}"]`);
        if (!existingCategory) {
            const categoryElement = createSkillCategory(category, groupedSkills[category]);
            skillsGrid.appendChild(categoryElement);
        }
    });
}

// Create skill category element
function createSkillCategory(categoryName, skills) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'skill-category';
    categoryDiv.setAttribute('data-category', categoryName);
    
    const categoryTitle = categoryName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let skillsHTML = '';
    skills.forEach(skill => {
        const statusIcon = skill.status === 'completed' ? '✅' : 
                          skill.status === 'learning' ? '🔄' :
