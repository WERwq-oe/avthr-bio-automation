const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google GenAI with your API key
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for development
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.post('/api/generate-bio', async (req, res) => {
    try {
        const { 
            name, 
            profession, 
            platform, 
            tone, 
            keywords, 
            includeEmojis, 
            includeHashtags, 
            creativeMode,
            bioLength,
            bioStyle,
            targetAudience,
            callToAction,
            includeStats,
            includeLocation
        } = req.body;

        // Input validation
        if (!name || !profession || !platform || !tone) {
            return res.status(400).json({
                error: 'Missing required fields: name, profession, platform, tone'
            });
        }

        const prompt = createPrompt({
            name,
            profession,
            platform,
            tone,
            keywords: keywords || '',
            includeEmojis,
            includeHashtags,
            creativeMode,
            // New advanced options
            bioLength: req.body.bioLength || 'medium',
            bioStyle: req.body.bioStyle || 'standard',
            targetAudience: req.body.targetAudience || 'general',
            callToAction: req.body.callToAction || 'none',
            includeStats: req.body.includeStats || false,
            includeLocation: req.body.includeLocation || false
        });

        // Use the latest Gemini model
        const model = 'gemini-2.0-flash-exp';
        const config = {
            temperature: creativeMode ? 0.9 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        };

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ];

        console.log(`🤖 Generating bio using Google GenAI SDK...`);
        console.log('📝 Model:', model);
        console.log('⚙️ Config:', config);

        try {
            // Use the streaming API for better performance and user experience
            const response = await ai.models.generateContentStream({
                model,
                config,
                contents,
            });

            let generatedText = '';
            console.log('📡 Receiving streamed response...');
            
            // Process the streaming response
            for await (const chunk of response) {
                if (chunk.text) {
                    generatedText += chunk.text;
                }
            }

            console.log('📝 Generated text from AI:', generatedText);
            
            const bios = parseBioResponse(generatedText);
            console.log('🎯 Parsed bios:', bios);

            if (bios.length === 0) {
                console.log('⚠️ No bios parsed, generating fallback...');
                const fallbackBios = generateFallbackBios({ 
                    name, 
                    profession, 
                    platform, 
                    tone, 
                    keywords, 
                    includeEmojis, 
                    includeHashtags 
                });
                
                return res.json({
                    success: true,
                    bios: fallbackBios,
                    metadata: {
                        platform,
                        tone,
                        hasEmojis: includeEmojis,
                        hasHashtags: includeHashtags,
                        creativeMode,
                        fallback: true,
                        message: "Generated using smart templates"
                    }
                });
            }

            return res.json({
                success: true,
                bios: bios,
                metadata: {
                    platform,
                    tone,
                    hasEmojis: includeEmojis,
                    hasHashtags: includeHashtags,
                    creativeMode,
                    model: model
                }
            });

        } catch (aiError) {
            console.error('❌ AI Generation Error:', aiError);
            
            // Provide intelligent fallback for common errors
            if (aiError.message?.includes('quota') || aiError.message?.includes('limit')) {
                console.log('🔄 API quota exceeded, generating fallback bios...');
                const fallbackBios = generateFallbackBios({ 
                    name, 
                    profession, 
                    platform, 
                    tone, 
                    keywords, 
                    includeEmojis, 
                    includeHashtags 
                });
                
                return res.json({
                    success: true,
                    bios: fallbackBios,
                    metadata: {
                        platform,
                        tone,
                        hasEmojis: includeEmojis,
                        hasHashtags: includeHashtags,
                        creativeMode,
                        fallback: true,
                        message: "Generated using smart templates (API limit reached)"
                    }
                });
            }

            return res.status(503).json({
                error: 'AI service temporarily unavailable. Please try again.',
                details: process.env.NODE_ENV === 'development' ? aiError.message : undefined,
                suggestion: "The AI service is temporarily busy. Please try again in a few moments."
            });
        }

    } catch (error) {
        console.error('Bio generation error:', error);
        res.status(500).json({
            error: 'Internal server error. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Analytics endpoint (optional)
app.post('/api/analytics', (req, res) => {
    const { event, platform, tone } = req.body;
    console.log('Analytics:', { event, platform, tone, timestamp: new Date() });
    res.json({ success: true });
});

// Serve the main HTML file for all non-API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions
function createPrompt(formData) {
    const platformLimits = {
        twitter: '160 characters',
        instagram: '150 characters',
        linkedin: '220 characters',
        tiktok: '80 characters',
        facebook: '101 characters'
    };

    const lengthGuidelines = {
        short: '10-15 words - very concise and punchy',
        medium: '20-25 words - balanced and informative',
        long: '30-35 words - detailed and comprehensive'
    };

    const styleGuidelines = {
        standard: 'Professional and straightforward',
        storytelling: 'Narrative approach with a story element',
        achievements: 'Focus on accomplishments and results',
        question: 'Pose an engaging question to the audience',
        humorous: 'Light-hearted and entertaining approach',
        minimalist: 'Clean, simple, and essential information only'
    };

    const audienceGuidelines = {
        general: 'Broad appeal for general audience',
        professional: 'Business-focused for networking',
        clients: 'Client-facing to attract potential customers',
        employers: 'Job-seeking focused for recruiters',
        peers: 'Industry-focused for professional peers',
        followers: 'Engaging for social media followers'
    };

    const ctaOptions = {
        none: '',
        contact: 'Get in touch!',
        follow: 'Follow for more!',
        connect: 'Let\'s connect!',
        collaborate: 'Open to collaboration!',
        hire: 'Available for hire!',
        learn: 'Learn more about my work!'
    };

    return `
Create 3 unique and engaging social media bios for ${formData.platform} with these specifications:

Personal Information:
- Name: ${formData.name}
- Profession: ${formData.profession}
- Keywords: ${formData.keywords || 'Professional, Creative, Authentic'}
- Tone: ${formData.tone}
- Platform: ${formData.platform} (${platformLimits[formData.platform] || '150 characters'} maximum)

Bio Specifications:
- Length: ${formData.bioLength || 'medium'} - ${lengthGuidelines[formData.bioLength] || lengthGuidelines.medium}
- Style: ${formData.bioStyle || 'standard'} - ${styleGuidelines[formData.bioStyle] || styleGuidelines.standard}
- Target Audience: ${formData.targetAudience || 'general'} - ${audienceGuidelines[formData.targetAudience] || audienceGuidelines.general}
- Call-to-Action: ${formData.callToAction !== 'none' ? ctaOptions[formData.callToAction] : 'No specific CTA required'}

Requirements:
- Include Emojis: ${formData.includeEmojis ? 'Yes - use relevant emojis naturally' : 'No - avoid emojis'}
- Include Hashtags: ${formData.includeHashtags ? 'Yes - add 2-3 relevant hashtags' : 'No - avoid hashtags'}
- Include Numbers/Stats: ${formData.includeStats ? 'Yes - incorporate relevant numbers or achievements' : 'No - avoid statistics'}
- Include Location: ${formData.includeLocation ? 'Yes - mention location if relevant' : 'No - avoid location references'}
- Creative Level: ${formData.creativeMode ? 'High - be unique and innovative' : 'Standard - professional but engaging'}

IMPORTANT LENGTH REQUIREMENTS:
- Short bios: MUST be exactly 10-15 words, no more, no less
- Medium bios: MUST be exactly 20-25 words, no more, no less  
- Long bios: MUST be exactly 30-35 words, no more, no less
- Count every word carefully and stay within the exact word limits
- Platform character limits still apply: ${platformLimits[formData.platform] || '150 characters'} maximum

Guidelines:
1. Each bio must be completely unique and reflect the ${formData.tone} personality
2. Stay strictly within the character limit for ${formData.platform}
3. Make each bio memorable and platform-appropriate
4. Incorporate the keywords naturally: ${formData.keywords}
5. Ensure each bio would appeal to the target ${formData.targetAudience} audience
6. Follow the ${formData.bioStyle} style approach
7. Avoid clichés and generic phrases
8. Make each bio actionable and engaging

Output Format:
BIO1: [complete bio content]
BIO2: [complete bio content]  
BIO3: [complete bio content]

Important: Only return the bios in the exact format above. No additional text, explanations, or formatting.
    `.trim();
}

function parseBioResponse(response) {
    const lines = response.split('\n').filter(line => line.trim());
    const bios = [];

    lines.forEach(line => {
        const match = line.match(/^BIO\d+:\s*(.+)$/);
        if (match) {
            bios.push(match[1].trim());
        }
    });

    // Fallback parsing if the format is different
    if (bios.length === 0) {
        const sentences = response.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.length < 300);
        
        return sentences.slice(0, 3).map(s => {
            let bio = s.trim();
            if (!bio.match(/[.!?]$/)) {
                bio += '.';
            }
            return bio;
        });
    }

    return bios.slice(0, 3);
}

function generateFallbackBios(formData) {
    const { name, profession, platform, tone, keywords, includeEmojis, includeHashtags } = formData;
    
    const emojiMap = {
        professional: '💼',
        creative: '🎨',
        witty: '😄',
        inspirational: '✨',
        casual: '👋'
    };
    
    const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : ['Innovation', 'Growth', 'Excellence'];
    const emoji = includeEmojis ? emojiMap[tone] || '🚀' : '';
    const hashtags = includeHashtags ? keywordList.slice(0, 2).map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';
    
    const templates = {
        professional: [
            `${name} | ${profession}. Passionate about ${keywordList[0] || 'excellence'} and driving results ${emoji}`,
            `${profession} focused on ${keywordList.slice(0, 2).join(' & ') || 'innovation'}. ${name} ${emoji}`,
            `${name}. ${profession} specializing in ${keywordList[0] || 'professional growth'} ${emoji}`
        ],
        creative: [
            `${name} ${emoji} ${profession} bringing ideas to life through ${keywordList[0] || 'creativity'}`,
            `Creative ${profession} | ${name}. Turning imagination into reality ${emoji}`,
            `${name}: ${profession} with a passion for ${keywordList[0] || 'artistic expression'} ${emoji}`
        ],
        witty: [
            `${name} | ${profession} who takes ${keywordList[0] || 'work'} seriously but not myself ${emoji}`,
            `Professional ${profession}, amateur ${keywordList[0] || 'coffee drinker'}. That's ${name} ${emoji}`,
            `${name}: ${profession} by day, ${keywordList[0] || 'dreamer'} by night ${emoji}`
        ],
        inspirational: [
            `${name} | ${profession} inspiring others through ${keywordList[0] || 'dedication'} ${emoji}`,
            `${profession} on a mission to make a difference. ${name} ${emoji}`,
            `${name}: ${profession} believing that ${keywordList[0] || 'passion'} changes everything ${emoji}`
        ],
        casual: [
            `Hey! I'm ${name}, a ${profession} who loves ${keywordList[0] || 'learning new things'} ${emoji}`,
            `${name} here ${emoji} Just a ${profession} sharing my journey with ${keywordList[0] || 'the world'}`,
            `${profession} ${emoji} ${name}. Always up for ${keywordList[0] || 'new adventures'}`
        ]
    };
    
    const selectedTemplates = templates[tone] || templates.professional;
    
    return selectedTemplates.map(bio => {
        let finalBio = bio;
        if (hashtags && includeHashtags) {
            finalBio += ` ${hashtags}`;
        }
        
        const limits = {
            twitter: 160,
            instagram: 150,
            linkedin: 220,
            tiktok: 80,
            facebook: 101
        };
        
        const limit = limits[platform] || 150;
        if (finalBio.length > limit) {
            finalBio = finalBio.substring(0, limit - 3) + '...';
        }
        
        return finalBio;
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Something went wrong! Please try again later.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AVTHR BIO Automation server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to view the app`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Using advanced AI technology for bio generation`);
    console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;