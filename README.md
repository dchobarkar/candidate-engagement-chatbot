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
   git clone https://github.com/dchobarkar/candidate-engagement-chatbot.git
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

## 💡 Author

Built by [Darshan Chobarkar](https://github.com/dchobarkar)  
LinkedIn: [https://www.linkedin.com/in/dchobarkar/](https://www.linkedin.com/in/dchobarkar/)
