# 🚀 AI Service Startup Guide

## Quick Start

### Method 1: Using Batch Script (Recommended for Windows)
```bash
# Navigate to ai-service directory
cd ai-service

# Run the startup script
start.bat
```

### Method 2: Direct Python
```bash
# Navigate to ai-service directory
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Start the service
python app.py
```

## What Happens During Startup?

When you run `python app.py`, the service will:

1. **📱 Detect Hardware**: Check if GPU is available for faster processing
2. **🗂️ Setup Cache**: Configure custom model storage paths (if set)
3. **📥 Download Models**: Download and cache AI models (first run only)
4. **⚡ Load Models**: Load models into memory for fast responses
5. **🌐 Start Server**: Start the Flask web service

## First Run Experience

### Expected Timeline
- **Sentiment Model**: ~2-3 minutes (500MB)
- **Summarization Model**: ~5-8 minutes (1.6GB) 
- **Text Generation Model**: ~15-25 minutes (16GB)
- **Total First Run**: 20-35 minutes

### What You'll See
```
============================================================
🤖 AI Sales Deck Generator - Model Loading
============================================================
📱 Device: GPU
🎮 GPU: NVIDIA GeForce RTX 4080
💾 GPU Memory: 16.0 GB
🗂️  Custom model cache: D:\AI_Models\huggingface

📥 Starting model downloads and loading...
⏰ This may take 10-30 minutes depending on your internet speed
💡 Models will be cached for future runs

📥 [1/3] Loading Sentiment Analysis (~500MB)...
    Model: cardiffnlp/twitter-roberta-base-sentiment-latest
    ✅ Loaded in 2.5 minutes

📥 [2/3] Loading Text Summarization (~1.6GB)...
    Model: facebook/bart-large-cnn
    ✅ Loaded in 5.2 minutes

📥 [3/3] Loading Text Generation - Llama 3.1 8B (~16GB)...
    Model: meta-llama/Llama-3.1-8B-Instruct
    ✅ Loaded in 18.3 minutes

⏱️  Total loading time: 25.8 minutes
✅ All models loaded successfully!
🚀 Service is ready for fast document processing

🤖 Loaded Models:
  📝 Text Generation: meta-llama/Llama-3.1-8B-Instruct
  📄 Summarization: facebook/bart-large-cnn
  😊 Sentiment Analysis: cardiffnlp/twitter-roberta-base-sentiment-latest

============================================================
🌐 Starting Flask server on http://localhost:5001
🏥 Health check: http://localhost:5001/health
📊 Model progress: http://localhost:5001/model-progress

🎯 Service ready for document processing!
============================================================
```

## Subsequent Runs

After the first run, models are cached so startup is **much faster** (1-3 minutes):

```
📥 [1/3] Loading Sentiment Analysis (~500MB)...
    ✅ Loaded in 0.2 minutes

📥 [2/3] Loading Text Summarization (~1.6GB)...
    ✅ Loaded in 0.5 minutes

📥 [3/3] Loading Text Generation - Llama 3.1 8B (~16GB)...
    ✅ Loaded in 1.8 minutes

⏱️  Total loading time: 2.5 minutes
```

## Configuration Options

### Custom Model Storage
Create `.env` file:
```env
# Store models on a different drive with more space
HF_HOME=D:\AI_Models\huggingface
HUGGINGFACE_HUB_CACHE=D:\AI_Models\huggingface\hub
TRANSFORMERS_CACHE=D:\AI_Models\huggingface\transformers
```

### Skip Model Loading (Development)
```env
# Skip model loading for faster development startup
SKIP_MODEL_LOADING=true
```

## Troubleshooting

### Download Interrupted
- Models support **resume downloads**
- Simply restart `python app.py` to continue

### Insufficient Storage
- Llama 3.1 8B requires ~16GB free space
- Set custom cache location: `HF_HOME=D:\AI_Models`

### GPU Memory Issues
- Service automatically uses CPU if GPU memory insufficient
- Reduce other GPU-intensive applications

### Model Loading Fails
- Service will try fallback models (DistilGPT2)
- Check internet connection
- Verify sufficient disk space

## Service Endpoints

Once running, the service provides:

- **Main Service**: `http://localhost:5001/process-sensitive-document`
- **Health Check**: `http://localhost:5001/health`
- **Model Status**: `http://localhost:5001/model-progress`
- **Manual Reload**: `http://localhost:5001/preload-models`

## Benefits of Startup Loading

✅ **Faster Response Times**: Models are ready immediately
✅ **Better User Experience**: No waiting during document processing  
✅ **Predictable Performance**: Consistent response times
✅ **Error Detection**: Model issues caught at startup, not during use
✅ **Progress Visibility**: See exactly what's happening during load

The trade-off is longer startup time, but much faster processing once running! 