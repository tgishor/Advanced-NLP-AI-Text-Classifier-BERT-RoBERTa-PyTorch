/**
 * Sales-Deck Focused Text Chunking Utility for Large Business Documents
 * Optimized for extracting coherent business insights and metrics
 */

function chunkText(text, maxChunkSize = 10000, overlapSize = 800) {
  if (!text || text.length <= maxChunkSize) {
    return [{
      text: text,
      index: 0,
      startChar: 0,
      endChar: text.length,
      length: text.length,
      context: extractDocumentContext(text)
    }];
  }

  console.log(`📄 Chunking business document: ${text.length} chars → ${maxChunkSize} char chunks`);
  
  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;
  
  // Extract overall document context for better processing
  const documentContext = extractDocumentContext(text);
  console.log(`🎯 Document context: ${documentContext.type} - ${documentContext.topics.join(', ')}`);

  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + maxChunkSize, text.length);
    
    // Smart break at business-relevant boundaries
    if (endIndex < text.length) {
      endIndex = findBusinessBreakPoint(text, startIndex, endIndex);
    }
    
    const chunkText = text.substring(startIndex, endIndex).trim();
    
    if (chunkText.length > 100) { // Minimum viable chunk size
      chunks.push({
        text: chunkText,
        index: chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
        length: chunkText.length,
        context: {
          ...documentContext,
          isFirstChunk: chunkIndex === 0,
          isLastChunk: endIndex >= text.length,
          totalChunks: Math.ceil(text.length / maxChunkSize)
        }
      });
      chunkIndex++;
    }
    
    // Move start position with overlap to preserve context
    startIndex = Math.max(endIndex - overlapSize, endIndex);
    if (startIndex >= text.length) break;
  }

  console.log(`✅ Created ${chunks.length} business-focused chunks`);
  return chunks;
}

function extractDocumentContext(text) {
  const sampleText = text.substring(0, 2000).toLowerCase();
  
  // Identify document type
  let type = 'business_document';
  if (sampleText.includes('annual report') || sampleText.includes('financial report')) {
    type = 'annual_report';
  } else if (sampleText.includes('revenue') || sampleText.includes('financial')) {
    type = 'financial_document';
  } else if (sampleText.includes('marketing') || sampleText.includes('brand')) {
    type = 'marketing_document';
  } else if (sampleText.includes('strategy') || sampleText.includes('competition')) {
    type = 'strategy_document';
  }

  // Extract key business topics
  const businessTopics = [];
  const topicPatterns = {
    'Financial Performance': ['revenue', 'profit', 'earnings', 'financial', 'income'],
    'Market Position': ['market', 'competition', 'share', 'position', 'industry'],
    'Growth Strategy': ['growth', 'expansion', 'strategy', 'objectives', 'goals'],
    'Operations': ['operations', 'production', 'efficiency', 'performance'],
    'Innovation': ['innovation', 'technology', 'development', 'research'],
    'Sustainability': ['sustainability', 'environment', 'social', 'governance', 'esg']
  };

  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(keyword => sampleText.includes(keyword))) {
      businessTopics.push(topic);
    }
  }

  return {
    type,
    topics: businessTopics.length > 0 ? businessTopics : ['Business Overview'],
    hasFinancialData: /\$[\d,]+|\d+[\.\d]*[mkb]|revenue|profit/.test(sampleText),
    hasMetrics: /\d+%|\d+\.\d+%|\d+[mkb]/.test(sampleText)
  };
}

function findBusinessBreakPoint(text, start, maxEnd) {
  const searchText = text.substring(start, maxEnd);
  
  // Priority 1: Section headers (often indicate topic changes)
  const sectionHeaders = ['\n## ', '\n# ', '\nSection ', '\nChapter ', '\n\n'];
  for (const header of sectionHeaders) {
    const pos = searchText.lastIndexOf(header);
    if (pos > searchText.length * 0.3) {
      return start + pos + header.length;
    }
  }
  
  // Priority 2: Business paragraph breaks
  const paragraphBreaks = ['\n\n', '. \n'];
  for (const breakPattern of paragraphBreaks) {
    const pos = searchText.lastIndexOf(breakPattern);
    if (pos > searchText.length * 0.4) {
      return start + pos + breakPattern.length;
    }
  }
  
  // Priority 3: Sentence endings with business context
  const businessSentenceEndings = ['. Revenue', '. The company', '. Financial', '. Market', '. Our'];
  for (const ending of businessSentenceEndings) {
    const pos = searchText.indexOf(ending);
    if (pos > searchText.length * 0.3 && pos < searchText.length * 0.8) {
      return start + pos + 2; // After the period
    }
  }
  
  // Priority 4: Regular sentence endings
  const sentenceEndings = ['. ', '.\n'];
  for (const ending of sentenceEndings) {
    const pos = searchText.lastIndexOf(ending);
    if (pos > searchText.length * 0.6) {
      return start + pos + ending.length;
    }
  }
  
  // Last resort: word boundary
  const pos = searchText.lastIndexOf(' ');
  if (pos > searchText.length * 0.8) {
    return start + pos + 1;
  }
  
  return maxEnd;
}

async function processChunks(chunks, processingFunction) {
  console.log(`🔄 Processing ${chunks.length} business-focused chunks`);
  
  const results = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`📝 Processing business chunk ${i + 1}/${chunks.length} (${chunk.length} chars) - Context: ${chunk.context.type}`);
    
    try {
      // Enhanced processing with business context
      const result = await processingFunction(chunk.text, chunk.context);
      results.push({
        ...result,
        chunkIndex: i,
        context: chunk.context
      });
    } catch (error) {
      console.error(`❌ Error processing business chunk ${i + 1}:`, error.message);
      results.push({
        error: error.message,
        summary: "",
        keywords: [],
        metrics: [],
        chunkIndex: i,
        context: chunk.context
      });
    }
  }

  return mergeBusinessResults(results);
}

function mergeBusinessResults(results) {
  const validResults = results.filter(r => !r.error);
  
  if (validResults.length === 0) {
    return {
      summary: "Business analysis failed - unable to extract meaningful insights",
      keywords: [],
      metrics: [],
      insights: "Document processing encountered technical difficulties",
      plotData: [],
      businessContext: "Analysis unavailable"
    };
  }

  // Create coherent business narrative
  const narrativeInsights = createBusinessNarrative(validResults);
  
  // Merge and prioritize business keywords
  const businessKeywords = mergeBusinessKeywords(validResults);
  
  // Consolidate financial metrics
  const businessMetrics = consolidateBusinessMetrics(validResults);
  
  // Extract plot-worthy data
  const businessPlotData = extractBusinessPlotData(validResults);

  return {
    summary: narrativeInsights.summary,
    keywords: businessKeywords,
    metrics: businessMetrics,
    insights: narrativeInsights.insights,
    plotData: businessPlotData,
    businessContext: narrativeInsights.context,
    processedChunks: results.length,
    successfulChunks: validResults.length,
    qualityScore: calculateBusinessQuality(validResults)
  };
}

function createBusinessNarrative(results) {
  // Group insights by business theme
  const themes = {
    financial: [],
    market: [],
    operations: [],
    strategy: []
  };

  results.forEach(result => {
    const text = (result.summary || '').toLowerCase();
    if (text.includes('revenue') || text.includes('financial') || text.includes('profit')) {
      themes.financial.push(result.summary);
    } else if (text.includes('market') || text.includes('competition') || text.includes('industry')) {
      themes.market.push(result.summary);
    } else if (text.includes('strategy') || text.includes('growth') || text.includes('expansion')) {
      themes.strategy.push(result.summary);
    } else {
      themes.operations.push(result.summary);
    }
  });

  // Build coherent narrative
  let narrative = '';
  if (themes.financial.length > 0) {
    narrative += 'Financial highlights: ' + themes.financial.join('. ') + '. ';
  }
  if (themes.market.length > 0) {
    narrative += 'Market position: ' + themes.market.join('. ') + '. ';
  }
  if (themes.strategy.length > 0) {
    narrative += 'Strategic focus: ' + themes.strategy.join('. ') + '. ';
  }
  if (themes.operations.length > 0) {
    narrative += 'Operational insights: ' + themes.operations.join('. ') + '.';
  }

  const insights = results.map(r => r.insights).filter(i => i && i.length > 20).join(' ');

  return {
    summary: narrative.length > 800 ? narrative.substring(0, 800) + '...' : narrative,
    insights: insights.length > 600 ? insights.substring(0, 600) + '...' : insights,
    context: `Business analysis covering ${Object.keys(themes).filter(k => themes[k].length > 0).join(', ')}`
  };
}

function mergeBusinessKeywords(results) {
  const businessKeywords = new Map();
  
  results.forEach(result => {
    (result.keywords || []).forEach(keyword => {
      const key = keyword.toLowerCase();
      businessKeywords.set(key, (businessKeywords.get(key) || 0) + 1);
    });
  });

  // Prioritize business-relevant keywords
  const businessTerms = ['revenue', 'growth', 'market', 'strategy', 'performance', 'innovation', 'customer', 'digital', 'sustainability'];
  
  return Array.from(businessKeywords.entries())
    .sort((a, b) => {
      const aIsBusiness = businessTerms.some(term => a[0].includes(term));
      const bIsBusiness = businessTerms.some(term => b[0].includes(term));
      
      if (aIsBusiness && !bIsBusiness) return -1;
      if (!aIsBusiness && bIsBusiness) return 1;
      return b[1] - a[1]; // Sort by frequency
    })
    .slice(0, 12)
    .map(([keyword]) => keyword);
}

function consolidateBusinessMetrics(results) {
  const metrics = new Map();
  
  results.forEach(result => {
    (result.metrics || []).forEach(metric => {
      if (metric.name && metric.value) {
        const key = metric.name.toLowerCase().trim();
        if (!metrics.has(key) || metric.value.toString().length > metrics.get(key).value.toString().length) {
          metrics.set(key, metric);
        }
      }
    });
  });

  return Array.from(metrics.values()).slice(0, 15);
}

function extractBusinessPlotData(results) {
  const plotData = [];
  
  results.forEach(result => {
    (result.plotData || []).forEach(plot => {
      if (plot.title && plot.values && plot.values.length > 0) {
        plotData.push(plot);
      }
    });
  });

  return plotData.slice(0, 8);
}

function calculateBusinessQuality(results) {
  const hasMetrics = results.some(r => r.metrics && r.metrics.length > 0);
  const hasPlots = results.some(r => r.plotData && r.plotData.length > 0);
  const hasInsights = results.some(r => r.insights && r.insights.length > 100);
  
  let score = 0;
  if (hasMetrics) score += 40;
  if (hasPlots) score += 30;
  if (hasInsights) score += 30;
  
  return Math.min(score, 100);
}

module.exports = {
  chunkText,
  processChunks,
  mergeBusinessResults,
  findBusinessBreakPoint,
  extractDocumentContext
}; 