# Deployment Guide

This guide covers deploying the Candidate Engagement Chatbot to production.

## Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- OpenAI API key with sufficient credits
- Domain name (optional)

## Deployment Steps

### 1. Prepare Your Code

Ensure your code is ready for production:

```bash
# Run linting
npm run lint

# Build locally to check for errors
npm run build

# Test the production build
npm start
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 4. Configure Environment Variables

In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
OPENAI_API_KEY=your_production_api_key_here
NODE_ENV=production
```

**Important**: 
- Use your production OpenAI API key
- Never commit API keys to version control
- Use Vercel's environment variable encryption

### 5. Configure Build Settings

Vercel should auto-detect Next.js, but verify:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

### 6. Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (usually 2-5 minutes)
3. Your app will be live at `your-project.vercel.app`

### 7. Verify Deployment

1. Visit your deployment URL
2. Test the chat functionality
3. Verify API endpoints are working
4. Check browser console for errors
5. Test on mobile devices

## Custom Domain Setup

### Adding a Custom Domain

1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Click "Add Domain"
4. Enter your domain name
5. Follow DNS configuration instructions

### DNS Configuration

Add the following DNS records:

**For apex domain (example.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.example.com)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

Vercel automatically provisions SSL certificates for all domains. This usually takes a few minutes.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | Auto-detected |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per minute | `10` |
| `SESSION_EXPIRY_HOURS` | Session expiry time | `24` |

## Production Checklist

Before going live, verify:

- [ ] All environment variables are set
- [ ] Production build succeeds
- [ ] API endpoints are working
- [ ] OpenAI API key is valid and has credits
- [ ] Error handling is working
- [ ] Mobile responsiveness is verified
- [ ] Performance is acceptable
- [ ] SSL certificate is active (if using custom domain)
- [ ] Analytics/monitoring is set up (optional)

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings for:
- Page views
- Performance metrics
- Error tracking

### Custom Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot, Pingdom)

## Troubleshooting

### Build Failures

**Problem**: Build fails in Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version is compatible
4. Check for TypeScript errors locally

### API Errors

**Problem**: API endpoints return errors

**Solutions**:
1. Verify environment variables are set correctly
2. Check OpenAI API key is valid
3. Verify API routes are in `app/api/` directory
4. Check server logs in Vercel dashboard

### Performance Issues

**Problem**: Slow page loads or API responses

**Solutions**:
1. Enable Vercel Edge Functions for API routes
2. Optimize images and assets
3. Check bundle size
4. Monitor API response times

### Environment Variable Issues

**Problem**: Environment variables not working

**Solutions**:
1. Verify variables are set in Vercel dashboard
2. Ensure variable names match exactly
3. Redeploy after adding new variables
4. Check for typos in variable names

## Rollback

If something goes wrong:

1. Go to Vercel dashboard
2. Navigate to "Deployments"
3. Find the last working deployment
4. Click "..." menu
5. Select "Promote to Production"

## CI/CD (Optional)

For automated deployments:

1. Connect GitHub repository to Vercel
2. Enable automatic deployments on push
3. Configure branch protection rules
4. Set up preview deployments for PRs

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use HTTPS**: Vercel provides SSL automatically
3. **Rate limiting**: Already implemented in API routes
4. **Input validation**: Zod schemas validate all inputs
5. **Error handling**: Don't expose sensitive errors to users

## Cost Optimization

1. **Vercel Free Tier**: 
   - 100GB bandwidth/month
   - Unlimited requests
   - Perfect for small to medium projects

2. **OpenAI API Costs**:
   - Monitor usage in OpenAI dashboard
   - Set usage limits
   - Use appropriate model (GPT-3.5-turbo is cheaper than GPT-4)

3. **Optimize API Calls**:
   - Cache responses when possible
   - Batch requests when appropriate
   - Use streaming for long responses

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Contact Vercel support if needed

---

**Happy Deploying! 🚀**

