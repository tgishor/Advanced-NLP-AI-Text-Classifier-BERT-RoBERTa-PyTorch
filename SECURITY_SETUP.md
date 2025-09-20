# 🔒 Security Setup Guide

## ⚠️ CRITICAL: Complete This Before GitHub Upload

This guide ensures all sensitive data is properly secured before hosting on GitHub.

## 🚨 Required Actions

### 1. Environment Variables Setup

**For AI Service:**
```bash
cd ai-service
cp ../env.example.ai-service .env
# Edit .env with your actual API keys
```

**For Server:**
```bash
cd server
cp ../env.example.server .env  
# Edit .env with your actual API keys
```

### 2. Required API Keys

You'll need to obtain these API keys:

#### RunPod API Key
- Sign up at https://runpod.ai
- Go to Settings > API Keys
- Create new API key
- Add to `ai-service/.env`: `RUNPOD_API_KEY=your_key_here`

#### OpenAI API Key  
- Sign up at https://platform.openai.com
- Go to API Keys section
- Create new secret key
- Add to `server/.env`: `OPENAI_API_KEY=your_key_here`

#### Hugging Face Token
- Sign up at https://huggingface.co
- Go to Settings > Access Tokens
- Create new token with read permissions
- Add to both `.env` files: `HUGGINGFACE_API_KEY=your_token_here`

#### Financial Data APIs (Optional)
- NewsAPI: https://newsapi.org/register
- Alpha Vantage: https://www.alphavantage.co/support/#api-key
- Finnhub: https://finnhub.io/register

### 3. Verify Security

Run this command to check for any remaining hardcoded secrets:
```bash
# Check for potential API keys
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=venv
grep -r "rpa_" . --exclude-dir=node_modules --exclude-dir=venv  
grep -r "hf_" . --exclude-dir=node_modules --exclude-dir=venv
```

Should return no results if properly secured.

### 4. Test Configuration

```bash
# Test AI service
cd ai-service
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✅ RUNPOD_API_KEY loaded' if os.getenv('RUNPOD_API_KEY') else '❌ Missing RUNPOD_API_KEY')"

# Test server
cd ../server
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? '✅ OPENAI_API_KEY loaded' : '❌ Missing OPENAI_API_KEY')"
```

## 🛡️ Security Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Use environment-specific configs** - Different keys for dev/prod
3. **Rotate API keys regularly** - Change keys every 90 days
4. **Monitor API usage** - Watch for unexpected charges
5. **Use least-privilege access** - Only grant necessary permissions

## 🚀 Ready for GitHub

Once you've completed all steps above, your code is secure for GitHub hosting!

## 🆘 If You Already Committed Secrets

If you accidentally committed API keys:

1. **Immediately revoke the exposed keys** in their respective platforms
2. **Generate new API keys** 
3. **Remove from git history**:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file/with/secrets' \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
4. **Update your environment files** with new keys
