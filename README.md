# AVTHR BIO Automation

AI-powered social media bio generator with advanced customization options.

## Features

- 🤖 **AI-Powered Generation** - Create unique bios using advanced AI
- 📏 **Word-Based Length Control** - Short (10-15), Medium (20-25), Long (30-35 words)
- 🎨 **Style Options** - Standard, Storytelling, Achievements, Question, Humorous, Minimalist
- 👥 **Target Audiences** - General, Professional, Clients, Employers, Peers, Followers
- 📢 **Call-to-Actions** - Contact, Follow, Connect, Collaborate, Hire, Learn More
- ✨ **Advanced Options** - Emojis, Hashtags, Statistics, Location inclusion
- 📱 **Multi-Platform** - Twitter, Instagram, LinkedIn, TikTok, Facebook
- 🎯 **Clean Design** - White bio templates with black text for readability

## Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Add your Gemini API key to `.env` file
4. Start the server: `npm start`
5. Open http://localhost:3000

## Environment Variables

Create a `.env` file with:

```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
PORT=3000
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy automatically

### Other Platforms

- Railway: Upload files directly
- Render: Connect GitHub repository
- Netlify: Deploy from GitHub
- Heroku: Use Dockerfile

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **AI**: Google Generative AI (Gemini)
- **Deployment**: Vercel, Railway, Render

## API Endpoints

- `GET /` - Main application
- `POST /api/generate-bio` - Generate bios with AI
- `GET /api/health` - Health check

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please create an issue in this repository.