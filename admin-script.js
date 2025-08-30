// Global variables
let currentSection = 'profile';
let tempData = {};

// Initialize admin panel on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    setupEventListeners();
    loadAllData();
    updateAnalytics();
});

// Initialize admin panel
function initializeAdminPanel() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');

    // Navigation functionality
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                currentSection = sectionId;
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Profile image upload
    const profileImageInput = document.getElementById('profileImageInput');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', handleImageUpload);
    }

    // Education form
    const educationForm = document.getElementById('educationForm');
    if (educationForm) {
        educationForm.addEventListener('submit', handleEducationSubmit);
    }

    // Skills form
    const skillsForm = document.getElementById('skillsForm');
    if (skillsForm) {
        skillsForm.addEventListener('submit', handleSkillsSubmit);
    }

    // Projects form
    const projectsForm = document.getElementById('projectsForm');
    if (projectsForm) {
        projectsForm.addEventListener('submit', handleProjectsSubmit);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Skill level range
    const skillLevel = document.getElementById('skillLevel');
    if (skillLevel) {
        skillLevel.addEventListener('input', function() {
            const skillLevelValue = document.getElementById('skillLevelValue');
            if (skillLevelValue) {
                skillLevelValue.textContent = this.value + '%';
            }
        });
    }

    // Level indicators
    const levelIndicators = document.querySelectorAll('.level-indicator');
    levelIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const level = indicator.getAttribute('data-level');
            const skillLevelInput = document.getElementById('skillLevel');
            const skillLevelValue = document.getElementById('skillLevelValue');
            
            if (skillLevelInput && skillLevelValue) {
                skillLevelInput.value = level;
                skillLevelValue.textContent = level + '%';
            }
        });
    });

    // Theme options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// Profile form submission
function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        title: document.getElementById('title').value.trim(),
        location: document.getElementById('location').value.trim(),
        about: document.getElementById('about').value.trim(),
        profileImage: document.getElementById('profilePreview').src
    };

    // Validation
    if (!formData.name || !formData.title || !formData.location || !formData.about) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Save to localStorage
    let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {};
    portfolioData = { ...portfolioData, ...formData };
    portfolioData.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    
    showNotification('Profile updated successfully!', 'success');
    trackEvent('profile_updated', 'admin');
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const profilePreview = document.getElementById('profilePreview');
        if (profilePreview) {
            profilePreview.src = e.target.result;
        }
        showNotification('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

// Education form submission
function handleEducationSubmit(e) {
    e.preventDefault();
    
    const educationItem = {
        id: Date.now(),
        degree: document.getElementById('degree').value.trim(),
        institution: document.getElementById('institution').value.trim(),
        percentage: document.getElementById('percentage').value.trim(),
        year: document.getElementById('year').value.trim(),
        status: document.getElementById('status').value,
        specialization: document.getElementById('specialization').value.trim(),
        isCustom: true,
        dateAdded: new Date().toISOString()
    };

    // Validation
    if (!educationItem.degree || !educationItem.status) {
        showNotification('Please fill in degree and status fields', 'error');
        return;
    }

    // Save education data
    let educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    educationData.push(educationItem);
    localStorage.setItem('educationData', JSON.stringify(educationData));
    
    // Reset form and reload list
    e.target.reset();
    loadEducationData();
    showNotification('Education record added successfully!', 'success');
    trackEvent('education_added', 'admin');
}

// Skills form submission
function handleSkillsSubmit(e) {
    e.preventDefault();
    
    const skillItem = {
        id: Date.now(),
        name: document.getElementById('skillName').value.trim(),
        category: document.getElementById('skillCategory').value,
        level: parseInt(document.getElementById('skillLevel').value),
        status: document.getElementById('skillStatus').value,
        description: document.getElementById('skillDescription').value.trim(),
        dateAdded: new Date().toISOString()
    };

    // Validation
    if (!skillItem.name || !skillItem.category || !skillItem.status) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Check for duplicate skills
    const existingSkills = JSON.parse(localStorage.getItem('skillsData')) || [];
    const isDuplicate = existingSkills.some(skill => 
        skill.name.toLowerCase() === skillItem.name.toLowerCase() && 
        skill.category === skillItem.category
    );

    if (isDuplicate) {
        showNotification('This skill already exists in the same category', 'warning');
        return;
    }

    // Save skills data
    existingSkills.push(skillItem);
    localStorage.setItem('skillsData', JSON.stringify(existingSkills));
    
    // Reset form and reload list
    e.target.reset();
    document.getElementById('skillLevelValue').textContent = '50%';
    loadSkillsData();
    showNotification('Skill added successfully!', 'success');
    trackEvent('skill_added', 'admin');
}

// Projects form submission
function handleProjectsSubmit(e) {
    e.preventDefault();
    
    const projectItem = {
        id: Date.now(),
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        technologies: document.getElementById('projectTech').value.split(',').map(tech => tech.trim()).filter(tech => tech),
        category: document.getElementById('projectCategory').value,
        status: document.getElementById('projectStatus').value,
        date: document.getElementById('projectDate').value,
        github: document.getElementById('projectGithub').value.trim(),
        demo: document.getElementById('projectDemo').value.trim(),
        imageUrl: document.getElementById('projectImage').value.trim(),
        isCustom: true,
        dateAdded: new Date().toISOString()
    };

    // Validation
    if (!projectItem.title || !projectItem.description || !projectItem.category || !projectItem.status) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (projectItem.technologies.length === 0) {
        showNotification('Please add at least one technology', 'error');
        return;
    }

    // Save projects data
    let projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    projectsData.push(projectItem);
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    
    // Reset form and reload list
    e.target.reset();
    loadProjectsData();
    updateProjectStats();
    showNotification('Project added successfully!', 'success');
    trackEvent('project_added', 'admin');
}

// Contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const contactData = {
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        github: document.getElementById('github').value.trim(),
        twitter: document.getElementById('twitter').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        website: document.getElementById('website').value.trim(),
        resumeUrl: document.getElementById('resume').value.trim()
    };

    // Validation
    if (!contactData.email || !contactData.phone) {
        showNotification('Please fill in email and phone fields', 'error');
        return;
    }

    if (!isValidEmail(contactData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Save to localStorage
    let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {};
    portfolioData = { ...portfolioData, ...contactData };
    portfolioData.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    
    showNotification('Contact information updated successfully!', 'success');
    trackEvent('contact_updated', 'admin');
}

// Load all data
function loadAllData() {
    loadProfileData();
    loadEducationData();
    loadSkillsData();
    loadProjectsData();
    loadContactData();
}

// Load profile data
function loadProfileData() {
    const data = JSON.parse(localStorage.getItem('portfolioData')) || {};
    
    // Populate form fields
    const fields = ['name', 'title', 'location', 'about'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && data[field]) {
            element.value = data[field];
        }
    });

    // Set profile image
    const profilePreview = document.getElementById('profilePreview');
    if (profilePreview && data.profileImage) {
        profilePreview.src = data.profileImage;
    }
}

// Load education data
function loadEducationData() {
    const educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    const container = document.getElementById('educationList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (educationData.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No education records added yet.</p></div>';
        return;
    }
    
    educationData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.degree}</h4>
                <p><strong>Institution:</strong> ${item.institution || 'Not specified'}</p>
                ${item.specialization ? `<p><strong>Specialization:</strong> ${item.specialization}</p>` : ''}
                <p><strong>Grade:</strong> ${item.percentage || 'Not specified'}</p>
                ${item.year ? `<p><strong>Year:</strong> ${item.year}</p>` : ''}
                <span class="status-badge status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
            </div>
            <div class="item-actions">
                <button class="btn-secondary" onclick="editEducation(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteEducation(${item.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Load skills data
function loadSkillsData() {
    const skillsData = JSON.parse(localStorage.getItem('skillsData')) || [];
    const container = document.getElementById('skillsList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (skillsData.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No skills added yet.</p></div>';
        return;
    }
    
    skillsData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p><strong>Category:</strong> ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</p>
                ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
                <div class="skill-progress-display">
                    <div class="skill-progress-fill" style="width: ${item.level}%"></div>
                </div>
                <span class="status-badge status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)} - ${item.level}%</span>
            </div>
            <div class="item-actions">
                <button class="btn-secondary" onclick="editSkill(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteSkill(${item.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Load projects data
function loadProjectsData() {
    const projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    const container = document.getElementById('projectsList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projectsData.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No projects added yet.</p></div>';
        return;
    }
    
    projectsData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <div class="tech-tags">
                    ${item.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <span class="status-badge status-${item.status.replace(' ', '-')}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                ${item.github || item.demo ? `<div class="project-links" style="margin-top: 0.5rem;">
                    ${item.github ? `<a href="${item.github}" target="_blank" class="btn-small">GitHub</a>` : ''}
                    ${item.demo ? `<a href="${item.demo}" target="_blank" class="btn-small">Demo</a>` : ''}
                </div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-secondary" onclick="editProject(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="deleteProject(${item.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Load contact data
function loadContactData() {
    const data = JSON.parse(localStorage.getItem('portfolioData')) || {};
    
    const fields = ['email', 'phone', 'address', 'linkedin', 'github', 'twitter', 'instagram', 'website', 'resume'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && data[field]) {
            element.value = data[field];
        }
    });
}

// Delete functions
function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education record?')) return;
    
    let educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    educationData = educationData.filter(item => item.id !== id);
    localStorage.setItem('educationData', JSON.stringify(educationData));
    
    loadEducationData();
    showNotification('Education record deleted successfully!', 'success');
    trackEvent('education_deleted', 'admin');
}

function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    let skillsData = JSON.parse(localStorage.getItem('skillsData')) || [];
    skillsData = skillsData.filter(item => item.id !== id);
    localStorage.setItem('skillsData', JSON.stringify(skillsData));
    
    loadSkillsData();
    showNotification('Skill deleted successfully!', 'success');
    trackEvent('skill_deleted', 'admin');
}

function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    let projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    projectsData = projectsData.filter(item => item.id !== id);
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    
    loadProjectsData();
    updateProjectStats();
    showNotification('Project deleted successfully!', 'success');
    trackEvent('project_deleted', 'admin');
}

// Edit functions (basic implementation)
function editEducation(id) {
    const educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    const item = educationData.find(edu => edu.id === id);
    
    if (!item) return;
    
    // Populate form with existing data
    document.getElementById('degree').value = item.degree || '';
    document.getElementById('institution').value = item.institution || '';
    document.getElementById('percentage').value = item.percentage || '';
    document.getElementById('year').value = item.year || '';
    document.getElementById('status').value = item.status || '';
    document.getElementById('specialization').value = item.specialization || '';
    
    // Delete the old item
    deleteEducation(id);
    
    showNotification('Education loaded for editing. Update the form and submit.', 'info');
}

function editSkill(id) {
    const skillsData = JSON.parse(localStorage.getItem('skillsData')) || [];
    const item = skillsData.find(skill => skill.id === id);
    
    if (!item) return;
    
    // Populate form with existing data
    document.getElementById('skillName').value = item.name || '';
    document.getElementById('skillCategory').value = item.category || '';
    document.getElementById('skillLevel').value = item.level || 50;
    document.getElementById('skillLevelValue').textContent = (item.level || 50) + '%';
    document.getElementById('skillStatus').value = item.status || '';
    document.getElementById('skillDescription').value = item.description || '';
    
    // Delete the old item
    deleteSkill(id);
    
    showNotification('Skill loaded for editing. Update the form and submit.', 'info');
}

function editProject(id) {
    const projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    const item = projectsData.find(project => project.id === id);
    
    if (!item) return;
    
    // Populate form with existing data
    document.getElementById('projectTitle').value = item.title || '';
    document.getElementById('projectDescription').value = item.description || '';
    document.getElementById('projectTech').value = item.technologies ? item.technologies.join(', ') : '';
    document.getElementById('projectCategory').value = item.category || '';
    document.getElementById('projectStatus').value = item.status || '';
    document.getElementById('projectDate').value = item.date || '';
    document.getElementById('projectGithub').value = item.github || '';
    document.getElementById('projectDemo').value = item.demo || '';
    document.getElementById('projectImage').value = item.imageUrl || '';
    
    // Delete the old item
    deleteProject(id);
    
    showNotification('Project loaded for editing. Update the form and submit.', 'info');
}

// Utility functions
function resetToDefault() {
    if (!confirm('Are you sure you want to reset the profile image to default?')) return;
    
    const profilePreview = document.getElementById('profilePreview');
    if (profilePreview) {
        profilePreview.src = 'grv.jpg';
    }
    
    showNotification('Profile image reset to default', 'success');
}

function previewChanges() {
    const formData = {
        name: document.getElementById('name').value,
        title: document.getElementById('title').value,
        location: document.getElementById('location').value,
        about: document.getElementById('about').value
    };
    
    // Store temporary data
    tempData = formData;
    
    // Open preview in new tab/window
    window.open('index.html', '_blank');
    showNotification('Preview opened in new tab', 'info');
}

function filterSkills() {
    const filter = document.getElementById('skillFilter').value;
    const skillItems = document.querySelectorAll('#skillsList .list-item');
    
    skillItems.forEach(item => {
        const categoryText = item.querySelector('.item-info p').textContent.toLowerCase();
        
        if (filter === 'all' || categoryText.includes(filter)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateProjectStats() {
    const projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    
    const totalProjects = projectsData.length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const inProgressProjects = projectsData.filter(p => p.status === 'in-progress').length;
    
    const totalElement = document.getElementById('totalProjects');
    const completedElement = document.getElementById('completedProjects');
    const inProgressElement = document.getElementById('inProgressProjects');
    
    if (totalElement) totalElement.textContent = totalProjects;
    if (completedElement) completedElement.textContent = completedProjects;
    if (inProgressElement) inProgressElement.textContent = inProgressProjects;
}

function updateAnalytics() {
    const educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    const skillsData = JSON.parse(localStorage.getItem('skillsData')) || [];
    const projectsData = JSON.parse(localStorage.getItem('projectsData')) || [];
    const portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {};
    
    const totalEducationElement = document.getElementById('totalEducation');
    const totalSkillsElement = document.getElementById('totalSkills');
    const analyticsProjectsElement = document.getElementById('analyticsProjects');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (totalEducationElement) totalEducationElement.textContent = educationData.length;
    if (totalSkillsElement) totalSkillsElement.textContent = skillsData.length;
    if (analyticsProjectsElement) analyticsProjectsElement.textContent = projectsData.length;
    
    if (lastUpdatedElement && portfolioData.lastUpdated) {
        const lastUpdated = new Date(portfolioData.lastUpdated);
        const now = new Date();
        const diffTime = Math.abs(now - lastUpdated);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            lastUpdatedElement.textContent = 'Today';
        } else if (diffDays < 7) {
            lastUpdatedElement.textContent = `${diffDays} days ago`;
        } else {
            lastUpdatedElement.textContent = lastUpdated.toLocaleDateString();
        }
    }
}

// Export/Import functions
function exportEducation() {
    const educationData = JSON.parse(localStorage.getItem('educationData')) || [];
    downloadJSON(educationData, 'education-data.json');
    trackEvent('education_exported', 'admin');
}

function clearAllEducation() {
    if (!confirm('Are you sure you want to clear all education records? This action cannot be undone.')) return;
    
    localStorage.removeItem('educationData');
    loadEducationData();
    showNotification('All education records cleared!', 'success');
    trackEvent('education_cleared', 'admin');
}

function exportAllData() {
    const allData = {
        portfolio: JSON.parse(localStorage.getItem('portfolioData')) || {},
        education: JSON.parse(localStorage.getItem('educationData')) || [],
        skills: JSON.parse(localStorage.getItem('skillsData')) || [],
        projects: JSON.parse(localStorage.getItem('projectsData')) || [],
        exportDate: new Date().toISOString()
    };
    
    downloadJSON(allData, 'portfolio-backup.json');
    showNotification('All data exported successfully!', 'success');
    trackEvent('data_exported', 'admin');
}

function importData() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.portfolio) {
                localStorage.setItem('portfolioData', JSON.stringify(importedData.portfolio));
            }
            if (importedData.education) {
                localStorage.setItem('educationData', JSON.stringify(importedData.education));
            }
            if (importedData.skills) {
                localStorage.setItem('skillsData', JSON.stringify(importedData.skills));
            }
            if (importedData.projects) {
                localStorage.setItem('projectsData', JSON.stringify(importedData.projects));
            }
            
            loadAllData();
            updateAnalytics();
            showNotification('Data imported successfully!', 'success');
            trackEvent('data_imported', 'admin');
            
        } catch (error) {
            showNotification('Invalid JSON file. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This action cannot be undone and will remove all your portfolio information.')) return;
    
    const keys = ['portfolioData', 'educationData', 'skillsData', 'projectsData'];
    keys.forEach(key => localStorage.removeItem(key));
    
    loadAllData();
    updateAnalytics();
    showNotification('All data cleared successfully!', 'success');
    trackEvent('all_data_cleared', 'admin');
}

// Appearance functions
function applyAppearance() {
    const selectedTheme = document.querySelector('.theme-option.active').getAttribute('data-theme');
    const animationsEnabled = document.getElementById('enableAnimations').checked;
    const animationSpeed = document.getElementById('animationSpeed').value;
    
    const appearanceSettings = {
        theme: selectedTheme,
        animations: animationsEnabled,
        speed: animationSpeed
    };
    
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    showNotification('Appearance settings applied!', 'success');
    trackEvent('appearance_updated', 'admin');
}

// Utility functions
function downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function trackEvent(action, category = 'admin', label = '') {
    const analytics = JSON.parse(localStorage.getItem('portfolioAnalytics')) || {
        events: []
    };
    
    analytics.events.push({
        action: action,
        category: category,
        label: label,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 events
    if (analytics.events.length > 100) {
        analytics.events = analytics.events.slice(-100);
    }
    
    localStorage.setItem('portfolioAnalytics', JSON.stringify(analytics));
}

// Add notification styles to the page
const adminNotificationStyles = `
<style>
.admin-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideInRight 0.3s ease;
    max-width: 400px;
}

.admin-notification.success {
    background: linear-gradient(45deg, #10b981, #34d399);
}

.admin-notification.error {
    background: linear-gradient(45deg, #dc2626, #ef4444);
}

.admin-notification.warning {
    background: linear-gradient(45deg, #f59e0b, #fbbf24);
}

.admin-notification.info {
    background: linear-gradient(45deg, #2563eb, #3b82f6);
}

.notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    transition: background 0.3s ease;
}

.notification-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
}

.empty-state p {
    font-size: 1.1rem;
    margin: 0;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .admin-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
</style>
`;

// Inject admin notification styles
document.head.insertAdjacentHTML('beforeend', adminNotificationStyles);
