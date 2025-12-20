# Candidate Engagement Chatbot

A specialized AI-powered chatbot that engages job applicants with contextually relevant information while qualifying their fit for positions. The system provides relevant job details while extracting candidate information during natural conversation.

## 🚀 Features

- **Intelligent Conversation**: Natural language conversations with AI-powered responses
- **Profile Extraction**: Automatically extracts candidate information from conversations
- **Job Information**: Displays detailed job requirements, responsibilities, and benefits
- **Real-time Updates**: Profile updates in real-time as conversation progresses
- **Session Management**: Persistent conversation sessions with state management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Performance Optimized**: Code splitting, lazy loading, and memoization

## 🛠️ Technology Stack

- **Framework**: Next.js 15.4.3 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.6
- **LLM Integration**: OpenAI API (GPT models)
- **Validation**: Zod 4.0.14
- **Date Handling**: date-fns 4.1.0
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **pnpm** package manager
- **OpenAI API Key** (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd candidate-engagement-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
candidate-engagement-chatbot/
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/              # Chat endpoint
│   │   ├── session/            # Session management
│   │   └── candidate-profile/  # Profile management
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx
│   │   ├── CandidateProfile.tsx
│   │   ├── JobInfo.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   ├── data/                   # Static data
│   │   └── job-description.ts
│   ├── lib/                    # Core libraries
│   │   ├── store.ts           # Zustand store
│   │   ├── llm-client.ts      # OpenAI client
│   │   ├── conversation-manager.ts
│   │   ├── data-extractor.ts
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx
├── public/                      # Static assets
├── .env.local                  # Environment variables (create this)
├── env.example                 # Environment variables example
├── next.config.ts              # Next.js configuration
├── package.json
└── README.md
```

## 🎯 Usage

### Starting a Conversation

1. Open the application in your browser
2. A new session is automatically created
3. Start chatting with the AI assistant about the job position
4. The system will extract your information as you chat

### Viewing Your Profile

1. Click on the "Profile" tab in the navigation
2. View your extracted information
3. Edit your profile if needed
4. See your profile completion percentage

### Viewing Job Information

1. Click on the "Job Info" tab in the navigation
2. Browse job requirements, responsibilities, and benefits
3. Job information is also available in the sidebar during chat

## 🔌 API Documentation

### Chat API

**Endpoint**: `POST /api/chat`

Send a message to the chatbot and receive an AI response.

**Request Body**:
```json
{
  "message": "Hello, I'm interested in this position",
  "sessionId": "session-uuid",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "127.0.0.1"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-uuid",
      "content": "Hello! I'd be happy to help...",
      "role": "assistant",
      "timestamp": "2024-01-01T00:00:00Z",
      "sessionId": "session-uuid"
    },
    "confidence": 0.85,
    "extractedInfo": {
      "name": "John Doe",
      "experience": { "years": 5 }
    },
    "processingTime": 1234
  }
}
```

### Session API

**Create Session**: `POST /api/session`

Create a new conversation session.

**Get Session**: `GET /api/session?sessionId=<id>`

Retrieve an existing session.

**Delete Session**: `DELETE /api/session?sessionId=<id>`

Delete a session.

### Candidate Profile API

**Get Profile**: `GET /api/candidate-profile?sessionId=<id>`

Retrieve candidate profile for a session.

**Update Profile**: `PUT /api/candidate-profile`

Update candidate profile information.

## 🏗️ Technical Decisions

### Why Next.js 15?

- **App Router**: Modern routing with server components
- **API Routes**: Built-in API endpoints
- **TypeScript**: Full type safety
- **Performance**: Optimized out of the box
- **Deployment**: Easy Vercel integration

### Why Zustand?

- **Lightweight**: Minimal bundle size
- **Simple API**: Easy to use and understand
- **TypeScript**: Excellent TypeScript support
- **Persistence**: Built-in persistence middleware
- **Performance**: No unnecessary re-renders

### Why OpenAI API?

- **Advanced Models**: Access to GPT-4 and other models
- **Reliability**: Stable and well-maintained
- **Features**: Rich API with many options
- **Documentation**: Comprehensive documentation

### Architecture Decisions

- **Component-Based**: Modular React components
- **State Management**: Centralized Zustand store
- **API Layer**: RESTful API routes
- **Type Safety**: Full TypeScript coverage
- **Performance**: Code splitting and lazy loading

## 🧪 Development

### Running Tests

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

## 🐛 Troubleshooting

### Common Issues

#### OpenAI API Key Not Working

**Problem**: Getting authentication errors from OpenAI API.

**Solution**:
1. Verify your API key is correct in `.env.local`
2. Ensure the key has sufficient credits
3. Check that the key has the correct permissions

#### Session Not Persisting

**Problem**: Session data is lost on page refresh.

**Solution**:
1. Check browser localStorage is enabled
2. Verify Zustand persistence is working
3. Check browser console for errors

#### Messages Not Sending

**Problem**: Messages are not being sent or received.

**Solution**:
1. Check network tab for API errors
2. Verify API routes are working
3. Check server logs for errors
4. Ensure session is valid

#### Build Errors

**Problem**: Production build fails.

**Solution**:
1. Run `npm run lint` to check for errors
2. Ensure all environment variables are set
3. Check TypeScript errors with `npx tsc --noEmit`
4. Verify all dependencies are installed

### Performance Issues

If you experience performance issues:

1. **Check Bundle Size**: Use `npm run build` to see bundle analysis
2. **Enable Production Mode**: Ensure `NODE_ENV=production`
3. **Check Network**: Verify API response times
4. **Monitor Memory**: Check browser DevTools for memory leaks

## 🚀 Deployment

### Deploying to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - Add `OPENAI_API_KEY` in Vercel dashboard
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

5. **Verify Deployment**
   - Test the deployed application
   - Check API endpoints are working

### Environment Variables for Production

```env
OPENAI_API_KEY=your_production_api_key
NODE_ENV=production
```

### Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## 📧 Support

For support, please open an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- OpenAI for the GPT API
- Next.js team for the amazing framework
- Zustand for state management
- Tailwind CSS for styling

---

**Built with ❤️ using Next.js and AI**