# RunPod + Local AI Service Setup Guide

## 🚀 Overview
Your system now uses **RunPod serverless** for Llama model processing while keeping smaller models (summarization, sentiment) running locally. This completely eliminates the GPU memory issues!

## 📋 Setup Steps

### 1. Add Your RunPod API Key

**Option A - Direct in code (Easier):**
Edit `ai-service/app.py` and replace:
```python
RUNPOD_API_KEY = "YOUR_API_KEY_HERE"
```
with your actual API key:
```python
RUNPOD_API_KEY = "your_actual_runpod_api_key_here"
```

**Option B - Environment file:**
Create `ai-service/.env` with your RunPod API key:
```env
RUNPOD_API_KEY=your_actual_runpod_api_key_here
```

### 2. Test the System

1. **Start the AI Service**:
   ```bash
   cd ai-service
   python app.py
   ```

2. **Test RunPod Connection**:
   ```bash
   curl http://localhost:5001/test-runpod
   ```

3. **Start the Node.js Server**:
   ```bash
   cd ../server
   npm start
   ```

4. **Start the Client**:
   ```bash
   cd ../client
   npm run dev
   ```

## 🔧 How It Works Now

### Architecture:
- **RunPod Serverless**: Handles Llama-3.1-8B for text generation, summarization, keyword extraction
- **Local CPU Models**: BART (summarization), RoBERTa (sentiment) - lightweight, fast
- **Smart Chunking**: Large documents split into 1500-character chunks
- **Memory Efficient**: No more GPU memory issues!

### Processing Flow:
1. Document uploaded → Node.js server
2. Server sends to Flask AI service (`/process-sensitive-document`)
3. Flask chunks document if needed
4. Each chunk processed via RunPod API
5. Results merged and returned

## 🎯 Benefits

✅ **No GPU Memory Issues**: Llama runs on RunPod's infrastructure  
✅ **Faster Processing**: No more 45-minute waits!  
✅ **Scalable**: RunPod handles demand automatically  
✅ **Cost Effective**: Pay only for actual processing time  
✅ **Secure**: Sensitive docs still processed locally (via your RunPod instance)  

## 🔍 Monitoring

- **Health Check**: `http://localhost:5001/health`
- **RunPod Test**: `http://localhost:5001/test-runpod`
- **Logs**: Check Flask console for processing status

## 🚨 Troubleshooting

1. **RunPod API Errors**: Check API key in `app.py` file (or `.env` if using environment variables)
2. **Local Models Failing**: Restart Flask app
3. **Timeout Issues**: RunPod has 30s timeout - adjust if needed

## 🚀 Quick Start Steps:

1. **Stop the current process** (Ctrl+C in the Flask terminal)

2. **Add your API key**: 
   - Edit `ai-service/app.py`
   - Replace `"YOUR_API_KEY_HERE"` with your actual RunPod API key

3. **Test the new system**:
   ```bash
   cd ai-service
   python app.py
   ```

4. **Test RunPod connection**:
   - Visit: `http://localhost:5001/test-runpod`

## 🎉 Ready to Test!

Your system should now process documents in **seconds instead of minutes**! 