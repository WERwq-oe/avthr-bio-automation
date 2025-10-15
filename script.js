// AVTHR BIO Automation - AI-Powered Bio Generator
class BioGenerator {
    constructor() {
        this.templates = [
            {
                id: 1,
                name: 'Creative',
                description: 'Artistic and expressive',
                image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop&crop=center'
            },
            {
                id: 2,
                name: 'Business',
                description: 'Professional and polished',
                image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=300&fit=crop&crop=center'
            },
            {
                id: 3,
                name: 'Personal',
                description: 'Authentic and relatable',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center'
            },
            {
                id: 4,
                name: 'Influencer',
                description: 'Engaging and trendy',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=center'
            },
            {
                id: 5,
                name: 'Tech',
                description: 'Innovation focused',
                image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&crop=center'
            },
            {
                id: 6,
                name: 'Lifestyle',
                description: 'Vibrant and inspiring',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=center'
            }
        ];
        this.generatedBios = [];
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTemplates();
        this.setupKeywordTags();
        this.setupThemeToggle();
        this.setupNavigation();
        this.setupContactForm();
        this.showPage('home');
    }

    setupNavigation() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');
        
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.add('hidden');
            }
        });

        // Update active navigation links
        this.updateActiveNav();
    }

    setupContactForm() {
        // Contact form functionality removed as per request
    }

    async handleContactSubmit() {
        // Contact form functionality removed as per request
    }

    updateActiveNav() {
        // Update navigation active states
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-primary', 'font-semibold');
            link.classList.add('text-gray-600', 'dark:text-gray-300');
        });

        // Set active link
        const activeLinks = document.querySelectorAll(`[onclick="showPage('${this.currentPage}')"]`);
        activeLinks.forEach(link => {
            link.classList.remove('text-gray-600', 'dark:text-gray-300');
            link.classList.add('text-primary', 'font-semibold');
        });
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Help button
        document.getElementById('helpButton').addEventListener('click', () => {
            this.showHelp();
        });

        // Generate bio
        const generateBtn = document.getElementById('generateBio');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateBio();
            });
        }

        // Generate more bios
        const generateMoreBtn = document.getElementById('generateMore');
        if (generateMoreBtn) {
            generateMoreBtn.addEventListener('click', () => {
                this.generateMoreBios();
            });
        }

        // Keywords input for tags
        const keywordsInput = document.getElementById('keywords');
        if (keywordsInput) {
            keywordsInput.addEventListener('input', (e) => {
                this.handleKeywordInput(e.target.value);
            });
        }

        // Form validation on input
        ['userName', 'userProfession', 'bioLength', 'bioStyle', 'targetAudience', 'callToAction'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateForm();
                });
                element.addEventListener('change', () => {
                    this.validateForm();
                });
            }
        });

        ['platform', 'tone'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.validateForm();
                });
            }
        });
    }

    loadTemplates() {
        const container = document.getElementById('templatesContainer');
        if (!container) return;
        
        // Create double set for infinite scroll effect
        const allTemplates = [...this.templates, ...this.templates];
        
        allTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'w-64 flex-shrink-0 template-card cursor-pointer';
            templateCard.innerHTML = `
                <div class="aspect-square w-full rounded-lg bg-cover bg-center shadow-lg" 
                     style="background-image: url('${template.image}')">
                    <div class="w-full h-full bg-black/30 rounded-lg flex items-end p-4">
                        <div class="text-white">
                            <h3 class="font-bold text-lg">${template.name}</h3>
                            <p class="text-sm opacity-90">${template.description}</p>
                        </div>
                    </div>
                </div>
            `;
            
            templateCard.addEventListener('click', () => {
                this.selectTemplate(template);
            });
            
            container.appendChild(templateCard);
        });
    }

    selectTemplate(template) {
        // Navigate to generator if not already there
        if (this.currentPage !== 'generator') {
            this.showPage('generator');
        }

        // Set tone based on template
        const toneSelect = document.getElementById('tone');
        if (toneSelect) {
            switch(template.name.toLowerCase()) {
                case 'creative':
                    toneSelect.value = 'creative';
                    break;
                case 'business':
                    toneSelect.value = 'professional';
                    break;
                case 'personal':
                    toneSelect.value = 'casual';
                    break;
                case 'influencer':
                    toneSelect.value = 'inspirational';
                    break;
                case 'tech':
                    toneSelect.value = 'professional';
                    break;
                case 'lifestyle':
                    toneSelect.value = 'inspirational';
                    break;
            }
        }

        // Add relevant keywords
        const keywordsInput = document.getElementById('keywords');
        if (keywordsInput) {
            const currentKeywords = keywordsInput.value;
            const templateKeywords = this.getTemplateKeywords(template.name);
            
            if (!currentKeywords.includes(templateKeywords)) {
                keywordsInput.value = currentKeywords ? `${currentKeywords}, ${templateKeywords}` : templateKeywords;
                this.handleKeywordInput(keywordsInput.value);
            }
        }

        // Scroll to form
        const bioForm = document.getElementById('bioForm');
        if (bioForm) {
            bioForm.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Show selection feedback
        this.showToast(`Selected ${template.name} template`, 'success');
    }

    getTemplateKeywords(templateName) {
        const keywordMap = {
            'Creative': 'Art, Design, Creative',
            'Business': 'Professional, Leadership, Business',
            'Personal': 'Authentic, Life, Personal',
            'Influencer': 'Social Media, Influence, Trendy',
            'Tech': 'Technology, Innovation, Digital',
            'Lifestyle': 'Life, Wellness, Inspiration'
        };
        return keywordMap[templateName] || '';
    }

    handleKeywordInput(value) {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const container = document.getElementById('tagsContainer');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        tags.forEach(tag => {
            if (tag) {
                const tagElement = document.createElement('span');
                tagElement.className = 'px-3 py-1 text-sm rounded-full bg-primary/20 dark:bg-primary/30 text-primary tag cursor-pointer';
                tagElement.textContent = tag;
                tagElement.addEventListener('click', () => {
                    this.removeTag(tag);
                });
                container.appendChild(tagElement);
            }
        });
    }

    removeTag(tagToRemove) {
        const keywordsInput = document.getElementById('keywords');
        if (keywordsInput) {
            const keywords = keywordsInput.value.split(',').map(tag => tag.trim());
            const filteredKeywords = keywords.filter(tag => tag !== tagToRemove);
            keywordsInput.value = filteredKeywords.join(', ');
            this.handleKeywordInput(keywordsInput.value);
        }
    }

    validateForm() {
        const name = document.getElementById('userName')?.value?.trim() || '';
        const profession = document.getElementById('userProfession')?.value?.trim() || '';
        const platform = document.getElementById('platform')?.value || '';
        const tone = document.getElementById('tone')?.value || '';
        
        const generateBtn = document.getElementById('generateBio');
        if (!generateBtn) return false;
        
        const isValid = name && profession && platform !== 'Platform' && tone !== 'Tone';
        
        generateBtn.disabled = !isValid;
        generateBtn.classList.toggle('opacity-50', !isValid);
        generateBtn.classList.toggle('cursor-not-allowed', !isValid);
        
        return isValid;
    }

    async generateBio() {
        if (!this.validateForm()) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const formData = this.getFormData();
            const bios = await this.callGeminiAPI(formData);
            
            this.generatedBios = bios;
            this.displayBios(bios);
            
            // Scroll to results
            const generatedBios = document.getElementById('generatedBios');
            if (generatedBios) {
                generatedBios.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
        } catch (error) {
            console.error('Error generating bio:', error);
            this.showToast('Failed to generate bio. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async generateMoreBios() {
        if (this.generatedBios.length === 0) {
            return this.generateBio();
        }

        this.setLoading(true);

        try {
            const formData = this.getFormData();
            const newBios = await this.callGeminiAPI(formData, true);
            
            this.generatedBios = [...this.generatedBios, ...newBios];
            this.displayBios(this.generatedBios);
            
        } catch (error) {
            console.error('Error generating more bios:', error);
            this.showToast('Failed to generate more bios. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('userName')?.value?.trim() || '',
            profession: document.getElementById('userProfession')?.value?.trim() || '',
            platform: document.getElementById('platform')?.value || '',
            tone: document.getElementById('tone')?.value || '',
            keywords: document.getElementById('keywords')?.value?.trim() || '',
            includeEmojis: document.getElementById('includeEmojis')?.checked || false,
            includeHashtags: document.getElementById('includeHashtags')?.checked || false,
            includeStats: document.getElementById('includeStats')?.checked || false,
            includeLocation: document.getElementById('includeLocation')?.checked || false,
            creativeMode: document.getElementById('creativeMode')?.checked || false,
            bioLength: document.getElementById('bioLength')?.value || 'medium',
            bioStyle: document.getElementById('bioStyle')?.value || 'standard',
            targetAudience: document.getElementById('targetAudience')?.value || 'general',
            callToAction: document.getElementById('callToAction')?.value || 'none'
        };
    }

    async callGeminiAPI(formData, isAdditional = false) {
        const requestBody = {
            ...formData,
            isAdditional
        };

        const response = await fetch('/api/generate-bio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.bios) {
            throw new Error('Invalid response from server');
        }
        
        return data.bios;
    }

    displayBios(bios) {
        const container = document.getElementById('biosContainer');
        const section = document.getElementById('generatedBios');
        
        if (!container || !section) return;
        
        container.innerHTML = '';
        
        bios.forEach((bio, index) => {
            const bioCard = document.createElement('div');
            bioCard.className = 'bio-output p-6 rounded-xl bg-white dark:bg-gray-100 border-2 border-gray-200 dark:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300';
            
            bioCard.innerHTML = `
                <div class="relative">
                    <p class="text-lg font-medium mb-4 leading-relaxed text-gray-900 break-words">${bio}</p>
                    <div class="flex gap-2">
                        <button class="copy-btn flex-1 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200" data-bio="${bio}">
                            <span class="material-symbols-outlined inline mr-1">content_copy</span>
                            Copy
                        </button>
                        <button class="edit-btn w-10 h-10 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200" data-bio="${bio}" data-index="${index}">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="regenerate-btn w-10 h-10 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200" data-index="${index}">
                            <span class="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(bioCard);
        });

        // Add event listeners for bio actions
        this.setupBioActions();
        
        section.classList.remove('hidden');
    }

    setupBioActions() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bio = btn.dataset.bio;
                this.copyToClipboard(bio);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bio = btn.dataset.bio;
                const index = parseInt(btn.dataset.index);
                this.editBio(bio, index);
            });
        });

        // Regenerate buttons
        document.querySelectorAll('.regenerate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.regenerateSingleBio(index);
            });
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Bio copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Bio copied to clipboard!', 'success');
        }
    }

    editBio(bio, index) {
        const newBio = prompt('Edit your bio:', bio);
        if (newBio && newBio !== bio) {
            this.generatedBios[index] = newBio;
            this.displayBios(this.generatedBios);
            this.showToast('Bio updated!', 'success');
        }
    }

    async regenerateSingleBio(index) {
        this.setLoading(true);
        
        try {
            const formData = this.getFormData();
            const newBios = await this.callGeminiAPI(formData, true);
            
            if (newBios.length > 0) {
                this.generatedBios[index] = newBios[0];
                this.displayBios(this.generatedBios);
                this.showToast('Bio regenerated!', 'success');
            }
        } catch (error) {
            console.error('Error regenerating bio:', error);
            this.showToast('Failed to regenerate bio. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        const generateBtn = document.getElementById('generateBio');
        const generateText = document.getElementById('generateText');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (!generateBtn || !generateText || !loadingSpinner) return;
        
        generateBtn.disabled = isLoading;
        generateText.classList.toggle('hidden', isLoading);
        loadingSpinner.classList.toggle('hidden', !isLoading);
        
        if (isLoading) {
            generateBtn.classList.add('opacity-75');
        } else {
            generateBtn.classList.remove('opacity-75');
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        
        // Check for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            html.classList.toggle('dark', savedTheme === 'dark');
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon();
        
        this.showToast(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info');
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('.material-symbols-outlined');
        const isDark = document.documentElement.classList.contains('dark');
        
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }

    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        helpModal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">How to Use AVTHR BIO</h3>
                    <button class="close-help p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">1. Fill Your Details</h4>
                        <p>Enter your name, profession, and select your target platform and desired tone.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">2. Add Keywords</h4>
                        <p>Include relevant keywords that represent your interests or expertise.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">3. Customize Options</h4>
                        <p>Choose whether to include emojis, hashtags, and enable creative mode for unique results.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">4. Generate & Edit</h4>
                        <p>Click generate to get 3 unique bio options. You can copy, edit, or regenerate any bio.</p>
                    </div>
                    <div class="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <p class="text-primary font-medium">💡 Pro Tip: Try different templates and tones to discover your perfect bio style!</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Close modal events
        helpModal.querySelector('.close-help').addEventListener('click', () => {
            document.body.removeChild(helpModal);
        });
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                document.body.removeChild(helpModal);
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };
        
        toast.className = `${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Navigation functions
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Update current page
    if (window.bioGenerator) {
        window.bioGenerator.currentPage = pageName;
        window.bioGenerator.updateActiveNav();
    }
    
    // Close mobile menu
    document.getElementById('mobileNav')?.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h3>
                <button class="close-policy p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="prose prose-sm dark:prose-invert">
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    <strong>Effective Date:</strong> January 1, 2025
                </p>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Information We Collect</h4>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    We only collect the information you provide when generating bios (name, profession, keywords) and contact form submissions. This data is processed temporarily and not stored permanently.
                </p>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">How We Use Your Information</h4>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Your information is used solely to generate personalized bios and respond to your inquiries. We do not share, sell, or distribute your personal information to third parties.
                </p>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Data Security</h4>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    We implement industry-standard security measures to protect your data during transmission and processing.
                </p>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h4>
                <p class="text-gray-600 dark:text-gray-300">
                    If you have any questions about this Privacy Policy, please contact us at support@avthr.com
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-policy').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bioGenerator = new BioGenerator();
});

// Add smooth scrolling for internal links
window.addEventListener('load', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});