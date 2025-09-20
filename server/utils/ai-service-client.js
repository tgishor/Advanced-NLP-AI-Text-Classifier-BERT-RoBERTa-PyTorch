const axios = require('axios');

/**
 * Sales-Deck Focused AI Service Client
 * Optimized for extracting business insights suitable for sales presentations
*/

class AIServiceClient {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.timeout = 90000; // Increased timeout for better processing
    this.retries = 3;
  }

  // Health check for AI service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('❌ AI Service health check failed:', error.message);
      return null;
    }
  }

  // Main function to process sensitive documents for sales deck creation
  async processSensitiveDocument(text, options = {}) {
    // Input validation - handle short text gracefully
    if (!text || typeof text !== 'string') {
      console.log('⚠️ Invalid text input - using fallback processing');
      return this.getFallbackResult('', new Error('Invalid text input'));
    }
    
    const textLength = text.trim().length;
    if (textLength < 100) {
      console.log(`⚠️ Text too short (${textLength} chars) - using fallback processing`);
      return this.getFallbackResult(text, new Error(`Text too short: ${textLength} characters`));
    }

    // ALWAYS process the full document. No more client-side chunking.
    // The Python AI service will handle the large request with RunPod.
    console.log(`🚀 Processing full sensitive document (${textLength} chars) via AI service.`);
    return await this.processSingleBusinessDocument(text, options);
  }

  // Process single document/chunk with sales-deck focus
  async processSingleBusinessDocument(text, options = {}) {
    const maxRetries = options.retries || this.retries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Calling AI service for sales-deck processing (attempt ${attempt}/${maxRetries})`);
        console.log(`📄 Document length: ${text.trim().length} characters`);
        
        // 🎯 ENHANCED SALES-DECK FOCUSED REQUEST DATA - NO TOKEN LIMITS!
        const requestData = {
          text: text.trim(),
          max_summary_length: options.maxSummaryLength || 400,  // Increased for better content
          max_keywords: options.maxKeywords || 12,              // More keywords for richer analysis
          business_context: options.businessContext || {},
          sales_deck_focus: true,
          extract_metrics: true,
          extract_competitive_insights: true,
          brand_focus: options.brandName || null,
          response_format: 'json',                              // Request JSON format
          require_complete_response: true,                      // Request complete responses
          no_truncation: true                                   // NO TOKEN LIMITS - Get complete response!
        };
        
        const response = await axios.post(
          `${this.aiServiceUrl}/process-sensitive-document`,
          requestData,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data) {
          console.log(`✅ Sales-deck AI processing completed successfully in ${response.data.processing_time || 'unknown'}s`);
          
          // Enhance response with sales-deck specific data
          return this.enhanceForSalesDeck(response.data, options);
        }

      } catch (error) {
        lastError = error;
        console.error(`⚠️ Sales-deck AI processing attempt ${attempt} failed:`, error.message);
        
        // Log more details for debugging
        if (error.response?.status === 400) {
          console.error(`💡 400 Error details:`, error.response?.data || 'No additional details');
          console.error(`📄 Request text length: ${text.trim().length}`);
        }

        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          const waitTime = Math.min(2000 * attempt, 8000); // Longer backoff for better processing
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
        }
      }
    }

    // If all retries failed, return enhanced fallback result
    console.error('❌ All sales-deck AI processing attempts failed, using enhanced fallback');
    return this.getEnhancedFallbackResult(text, lastError, options);
  }

  // Enhance AI response for sales deck presentation
  enhanceForSalesDeck(aiResponse, options = {}) {
    const enhanced = { ...aiResponse };

    // 🎯 Sales-deck specific enhancements
    if (enhanced.summary) {
      enhanced.summary = this.optimizeSummaryForSalesDeck(enhanced.summary, options.businessContext);
    }

    if (enhanced.keywords) {
      enhanced.keywords = this.prioritizeBusinessKeywords(enhanced.keywords);
    }

    if (enhanced.metrics) {
      enhanced.metrics = this.formatMetricsForSalesDeck(enhanced.metrics);
    }

    // Generate additional sales-deck insights
    enhanced.salesDeckInsights = this.generateSalesDeckInsights(enhanced, options.businessContext);
    enhanced.executiveSummary = this.generateExecutiveSummary(enhanced);
    enhanced.keyTakeaways = this.extractKeyTakeaways(enhanced);

    return enhanced;
  }

  // Optimize summary for sales presentation
  optimizeSummaryForSalesDeck(summary, businessContext) {
    if (!summary || summary.length < 50) return summary;

    // Focus on business value and outcomes
    let optimized = summary.replace(/^(ANSWER|SUMMARY):\s*/i, '');
    
    // Add business context if available
    if (businessContext?.topics?.length > 0) {
      const topics = businessContext.topics.join(', ');
      if (!optimized.toLowerCase().includes('business') && !optimized.toLowerCase().includes('company')) {
        optimized = `Business focus areas include ${topics.toLowerCase()}. ${optimized}`;
      }
    }

    // Ensure it ends with a strong business statement
    if (!optimized.match(/[.!]$/)) {
      optimized += '.';
    }

    return optimized.length > 400 ? optimized.substring(0, 400) + '...' : optimized;
  }

  // Prioritize business-relevant keywords
  prioritizeBusinessKeywords(keywords) {
    if (!Array.isArray(keywords)) return [];

    const businessPriority = ['revenue', 'growth', 'market', 'strategy', 'performance', 'innovation', 'customer', 'digital', 'sustainability', 'profit', 'expansion'];
    
    return keywords
      .filter(keyword => keyword && keyword.length > 2)
      .sort((a, b) => {
        const aIsBusiness = businessPriority.some(term => a.toLowerCase().includes(term));
        const bIsBusiness = businessPriority.some(term => b.toLowerCase().includes(term));
        
        if (aIsBusiness && !bIsBusiness) return -1;
        if (!aIsBusiness && bIsBusiness) return 1;
        return 0;
      })
      .slice(0, 10);
  }

  // Format metrics for sales deck presentation
  formatMetricsForSalesDeck(metrics) {
    if (!Array.isArray(metrics)) return [];

    return metrics
      .filter(metric => metric && metric.name && metric.value)
      .map(metric => ({
        ...metric,
        salesDeckReady: true,
        formatted: this.formatMetricValue(metric),
        category: this.categorizeMetric(metric.name)
      }))
      .slice(0, 12);
  }

  // Format metric values for presentation
  formatMetricValue(metric) {
    if (!metric.value) return metric.value;

    const value = metric.value.toString();
    
    // Handle financial values
    if (value.includes('€') || value.includes('$') || metric.name.toLowerCase().includes('revenue')) {
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Handle percentages
    if (value.includes('%')) {
      return value;
    }

    // Handle large numbers
    if (/^\d+$/.test(value) && parseInt(value) > 1000) {
      return parseInt(value).toLocaleString();
    }

    return value;
  }

  // Categorize metrics for sales deck organization
  categorizeMetric(metricName) {
    const name = metricName.toLowerCase();
    
    if (name.includes('revenue') || name.includes('profit') || name.includes('income')) {
      return 'Financial';
    }
    if (name.includes('growth') || name.includes('increase')) {
      return 'Growth';
    }
    if (name.includes('market') || name.includes('share')) {
      return 'Market';
    }
    if (name.includes('customer') || name.includes('satisfaction')) {
      return 'Customer';
    }
    
    return 'Operational';
  }

  // Generate sales-deck specific insights
  generateSalesDeckInsights(aiResponse, businessContext) {
    const insights = [];

    if (aiResponse.summary) {
      insights.push(`Key Business Narrative: ${aiResponse.summary.substring(0, 200)}...`);
    }

    if (aiResponse.keywords?.length > 3) {
      insights.push(`Strategic Focus Areas: ${aiResponse.keywords.slice(0, 5).join(', ')}`);
    }

    if (aiResponse.metrics?.length > 0) {
      const topMetrics = aiResponse.metrics.slice(0, 3);
      insights.push(`Performance Highlights: ${topMetrics.map(m => `${m.name}: ${m.value}`).join(', ')}`);
    }

    if (businessContext?.topics?.length > 0) {
      insights.push(`Business Context: Analysis covers ${businessContext.topics.join(', ').toLowerCase()}`);
    }

    return insights.slice(0, 4);
  }

  // Generate executive summary for sales deck
  generateExecutiveSummary(aiResponse) {
    const elements = [];

    if (aiResponse.summary) {
      elements.push(aiResponse.summary.split('.')[0] + '.');
    }

    if (aiResponse.metrics?.length > 0) {
      const keyMetric = aiResponse.metrics[0];
      elements.push(`Key performance indicator: ${keyMetric.name} of ${keyMetric.value}.`);
    }

    if (aiResponse.keywords?.length > 2) {
      elements.push(`Strategic priorities include ${aiResponse.keywords.slice(0, 3).join(', ')}.`);
    }

    return elements.join(' ').substring(0, 300);
  }

  // Extract key takeaways for sales presentation
  extractKeyTakeaways(aiResponse) {
    const takeaways = [];

    if (aiResponse.metrics?.length > 0) {
      takeaways.push(`Strong Performance: ${aiResponse.metrics.length} key metrics identified`);
    }

    if (aiResponse.keywords?.length > 0) {
      takeaways.push(`Strategic Focus: ${aiResponse.keywords.slice(0, 3).join(', ')}`);
    }

    if (aiResponse.summary?.length > 100) {
      takeaways.push('Comprehensive Business Analysis: Detailed insights extracted');
    }

    takeaways.push('AI-Powered Intelligence: Local processing ensures data security');

    return takeaways.slice(0, 4);
  }

  // Enhanced fallback result for sales deck
  getEnhancedFallbackResult(text, error, options = {}) {
    const summary = this.getSummaryFallback(text, 300);
    const keywords = this.extractKeywordsFallback(text, 10);
    const metrics = this.extractMetricsFallback(text);

    return {
      summary: this.optimizeSummaryForSalesDeck(summary, options.businessContext),
      keywords: this.prioritizeBusinessKeywords(keywords),
      metrics: this.formatMetricsForSalesDeck(metrics),
      insights: this.generateInsightsFallback(keywords, metrics),
      plotData: this.generatePlotDataFallback(keywords, metrics),
      salesDeckInsights: [`Fallback Analysis: Processing completed with limited AI capabilities`, `Business Context: ${text.length} characters analyzed locally`],
      executiveSummary: `Business document analysis completed using local processing. ${keywords.slice(0, 3).join(', ')} identified as key focus areas.`,
      keyTakeaways: ['Local Processing Completed', 'Basic Business Analysis Available', 'Data Security Maintained'],
      processedLocally: true,
      processedWithAI: false,
      fallback: true,
      salesDeckOptimized: true,
      error: error?.message || 'AI service unavailable',
      timestamp: new Date().toISOString()
    };
  }

  // Extract keywords using AI service
  async extractKeywords(text, maxKeywords = 10) {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/extract-keywords`,
        {
          text: text,
          max_keywords: maxKeywords,
          business_focus: true
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return this.prioritizeBusinessKeywords(response.data.keywords || []);

    } catch (error) {
      console.error('⚠️ AI keyword extraction failed:', error.message);
      return this.prioritizeBusinessKeywords(this.extractKeywordsFallback(text, maxKeywords));
    }
  }

  // Summarize text using AI service with sales-deck focus
  async summarizeText(text, maxLength = 200) {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/summarize`,
        {
          text: text,
          max_length: maxLength,
          sales_deck_focus: true,
          business_context: true
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return this.optimizeSummaryForSalesDeck(response.data.summary || this.getSummaryFallback(text, maxLength));

    } catch (error) {
      console.error('⚠️ AI summarization failed:', error.message);
      return this.optimizeSummaryForSalesDeck(this.getSummaryFallback(text, maxLength));
    }
  }

  // Check if AI service is available
  async isAvailable() {
    const health = await this.healthCheck();
    return health && health.status === 'healthy';
  }

  // Wait helper
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fallback result when AI service is not available
  getFallbackResult(text, error) {
    return this.getEnhancedFallbackResult(text, error);
  }

  // Fallback text processing methods
  getSummaryFallback(text, maxLength = 250) {
    if (text.length <= maxLength) return text;
    
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    const summary = sentences.slice(0, 4).join('. ');
    
    if (summary.length <= maxLength) return summary + '.';
    return summary.substring(0, maxLength - 3) + '...';
  }

  extractKeywordsFallback(text, maxKeywords) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their']);
    
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 3 && !stopWords.has(word));
    const wordCount = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  extractMetricsFallback(text) {
    const patterns = [
      /revenue.*?[\$€]?[\d,]+[\.\d]*[mkb]?/gi,
      /profit.*?[\$€]?[\d,]+[\.\d]*[mkb]?/gi,
      /growth.*?[\d,]+[\.\d]*%?/gi,
      /market share.*?[\d,]+[\.\d]*%?/gi,
      /customers?.*?[\d,]+[\.\d]*[mkb]?/gi,
      /sales.*?[\$€]?[\d,]+[\.\d]*[mkb]?/gi,
      /margin.*?[\d,]+[\.\d]*%?/gi,
      /income.*?[\$€]?[\d,]+[\.\d]*[mkb]?/gi
    ];
    
    const metrics = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        metrics.push(...matches.slice(0, 2).map(match => ({
          name: match.split(/[\d\$€]/)[0].trim(),
          value: match.match(/[\d,]+[\.\d]*[%mkb]?/)?.[0] || '',
          unit: match.includes('%') ? '%' : (match.includes('$') ? 'USD' : (match.includes('€') ? 'EUR' : '')),
          category: 'Financial'
        })));
      }
    });
    
    return metrics.slice(0, 12);
  }

  generateInsightsFallback(keywords, metrics) {
    const insights = [];
    
    if (keywords.length > 0) {
      insights.push(`Business focus areas include: ${keywords.slice(0, 5).join(', ')}`);
    }
    
    if (metrics.length > 0) {
      insights.push(`Key performance metrics identified: ${metrics.slice(0, 3).map(m => m.name).join(', ')}`);
    }
    
    insights.push("Analysis completed using local processing with enhanced business intelligence capabilities.");
    
    return insights.join(' ');
  }

  generatePlotDataFallback(keywords, metrics) {
    const plots = [];
    
    if (keywords.length > 3) {
      plots.push({
        title: "Strategic Focus Areas",
        type: "bar",
        labels: keywords.slice(0, 5),
        values: keywords.slice(0, 5).map(() => Math.floor(Math.random() * 15) + 10)
      });
    }

    if (metrics.length > 0) {
      plots.push({
        title: "Business Performance Indicators",
        type: "line",
        labels: ["Q1", "Q2", "Q3", "Q4"],
        values: [30, 35, 40, 45]
      });
    }
    
    return plots;
  }

  // Generate local insights from analysis results (for compatibility)
  generateLocalInsights(analysisResults) {
    if (analysisResults.salesDeckInsights) {
      return analysisResults.salesDeckInsights.join(' ');
    }
    
    if (analysisResults.insights) {
      return analysisResults.insights;
    }
    
    return this.generateInsightsFallback(
      analysisResults.keywords || [], 
      analysisResults.metrics || []
    );
  }
}

// Create singleton instance
const aiServiceClient = new AIServiceClient();

// Export compatible interface with the old local-model
module.exports = {
  // Main processing function
  processSensitiveDocument: (text) => aiServiceClient.processSensitiveDocument(text),
  
  // Individual functions for backward compatibility
  generateSummary: (text, maxLength) => aiServiceClient.summarizeText(text, maxLength),
  extractKeywords: (text, maxKeywords) => aiServiceClient.extractKeywords(text, maxKeywords),
  extractBusinessMetrics: (text) => aiServiceClient.extractMetricsFallback(text),
  generateLocalPlotData: (text) => aiServiceClient.generatePlotDataFallback([], []),
  generateLocalInsights: (analysisResults) => aiServiceClient.generateLocalInsights(analysisResults),
  
  // AI service client instance
  aiServiceClient
}; 