const localModel = require('./ai-service-client');
const { chunkText, processChunks } = require('./text-chunker');

/**
 * Secure Data Extraction for Sensitive Documents with Smart Chunking
 * Processes sensitive documents locally without sending data to external APIs
 */

class SecureDataExtractor {
  constructor() {
    this.sessionId = Date.now().toString();
  }

  // Enhanced logging function
  log(agentName, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔒 [${agentName}] ${timestamp}`);
    console.log(`📝 ${message}`);
    if (data) {
      console.log(`📊 Data:`, JSON.stringify(data, null, 2));
    }
    console.log(`─────────────────────────────────────────`);
  }

  // Main extraction function for sensitive documents
  async extractSensitiveDataTables(text, brandName) {
    console.log('\n🔒 ========= SECURE DATA EXTRACTION STARTING =========');
    console.log(`📄 Document length: ${text.length} characters`);
    console.log(`🏢 Brand: ${brandName}`);
    console.log(`🔢 Session ID: ${this.sessionId}`);
    console.log('🛡️ Processing: SENSITIVE DOCUMENTS - LOCAL ONLY');
    
    if (!text || text.trim().length < 50) {
      this.log('SYSTEM', '⚠️ Text too short for meaningful extraction');
      return { tables: [], keyMetrics: [], timeSeriesData: [] };
    }

    try {
      this.log('COORDINATOR', '🔒 Starting secure local processing...');

      // Secure Agent 1: Local Structure Analysis
      this.log('SECURE-AGENT-1', '🔍 Starting Local Structure Analysis...');
      const structuredData = await this.localStructureAnalysis(text, brandName);
      this.log('SECURE-AGENT-1', `✅ Local Structure Analysis complete`, {
        tablesFound: structuredData.tables?.length || 0
      });
      
      // Secure Agent 2: Local Metrics Extraction
      this.log('SECURE-AGENT-2', '📊 Starting Local Metrics Extraction...');
      const metricsData = await this.localMetricsExtraction(text, brandName);
      this.log('SECURE-AGENT-2', `✅ Local Metrics Extraction complete`, {
        metricsFound: metricsData.keyMetrics?.length || 0
      });
      
      // Secure Agent 3: Local Time Series Analysis
      this.log('SECURE-AGENT-3', '📈 Starting Local Time Series Analysis...');
      const timeSeriesData = await this.localTimeSeriesAnalysis(text, brandName);
      this.log('SECURE-AGENT-3', `✅ Local Time Series Analysis complete`, {
        seriesFound: timeSeriesData.timeSeriesData?.length || 0
      });
      
      // Secure Agent 4: Local Data Validation
      this.log('SECURE-AGENT-4', '🔍 Starting Local Data Validation...');
      const validatedData = await this.localDataValidation({
        tables: structuredData.tables || [],
        keyMetrics: metricsData.keyMetrics || [],
        timeSeriesData: timeSeriesData.timeSeriesData || []
      });
      this.log('SECURE-AGENT-4', `✅ Local Data Validation complete`);

      console.log('\n🔒 ========= SECURE EXTRACTION SUMMARY =========');
      console.log(`✅ Tables extracted locally: ${validatedData.tables.length}`);
      console.log(`✅ Metrics extracted locally: ${validatedData.keyMetrics.length}`);
      console.log(`✅ Time series extracted locally: ${validatedData.timeSeriesData.length}`);
      console.log(`🛡️ Session ${this.sessionId} completed securely`);
      console.log('=====================================\n');
      
      return validatedData;
    } catch (error) {
      this.log('ERROR', `❌ Secure extraction failed: ${error.message}`);
      console.error('Full error:', error);
      return { tables: [], keyMetrics: [], timeSeriesData: [] };
    }
  }

  // Local Structure Analysis - using pattern matching
  async localStructureAnalysis(text, brandName) {
    try {
      const tables = this.extractTablesFromText(text);
      return { tables };
    } catch (error) {
      this.log('SECURE-AGENT-1', `❌ Local structure analysis error: ${error.message}`);
      return { tables: [] };
    }
  }

  // Local Metrics Extraction - using regex patterns
  async localMetricsExtraction(text, brandName) {
    try {
      const metrics = this.extractMetricsFromText(text);
      return { keyMetrics: metrics };
    } catch (error) {
      this.log('SECURE-AGENT-2', `❌ Local metrics extraction error: ${error.message}`);
      return { keyMetrics: [] };
    }
  }

  // Local Time Series Analysis
  async localTimeSeriesAnalysis(text, brandName) {
    try {
      const timeSeries = this.extractTimeSeriesFromText(text);
      return { timeSeriesData: timeSeries };
    } catch (error) {
      this.log('SECURE-AGENT-3', `❌ Local time series analysis error: ${error.message}`);
      return { timeSeriesData: [] };
    }
  }

  // Local Data Validation
  async localDataValidation(rawData) {
    const validated = {
      tables: (rawData.tables || []).filter(table => 
        table.headers && table.rows && table.headers.length >= 2 && table.rows.length >= 1
      ),
      keyMetrics: (rawData.keyMetrics || []).filter(metric => 
        metric.name && metric.value && metric.value !== 'N/A'
      ),
      timeSeriesData: (rawData.timeSeriesData || []).filter(series => 
        series.dataPoints && series.dataPoints.length >= 2 && series.title
      )
    };
    
    return validated;
  }

  // Pattern-based table extraction
  extractTablesFromText(text) {
    const tables = [];
    const lines = text.split('\n');
    let currentTable = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect potential table headers
      if (line.includes('|') || line.includes('\t') || (line.match(/\s{2,}/g) || []).length > 2) {
        const cells = this.splitTableRow(line);
        
        if (cells.length >= 2) {
          if (!currentTable) {
            currentTable = {
              title: `Financial Data Table ${tables.length + 1}`,
              headers: cells,
              rows: [],
              metadata: { source: 'Local pattern detection', extractedLocally: true }
            };
          } else {
            currentTable.rows.push(cells);
          }
        }
      } else if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
        currentTable = null;
      }
    }
    
    if (currentTable && currentTable.rows.length > 0) {
      tables.push(currentTable);
    }
    
    return tables;
  }

  // Split table row into cells
  splitTableRow(line) {
    if (line.includes('|')) {
      return line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
    } else if (line.includes('\t')) {
      return line.split('\t').map(cell => cell.trim()).filter(cell => cell.length > 0);
    } else {
      return line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell.length > 0);
    }
  }

  // Extract metrics using patterns
  extractMetricsFromText(text) {
    const metrics = [];
    
    const patterns = [
      { regex: /revenue[:\s]*\$?([\d,]+\.?\d*)\s*(million|billion|k|m|b)?/gi, name: 'Revenue' },
      { regex: /net\s+income[:\s]*\$?([\d,]+\.?\d*)\s*(million|billion|k|m|b)?/gi, name: 'Net Income' },
      { regex: /profit[:\s]*\$?([\d,]+\.?\d*)\s*(million|billion|k|m|b)?/gi, name: 'Profit' },
      { regex: /growth[:\s]*([\d,]+\.?\d*)%?/gi, name: 'Growth Rate' },
      { regex: /market\s+share[:\s]*([\d,]+\.?\d*)%?/gi, name: 'Market Share' },
      { regex: /margin[:\s]*([\d,]+\.?\d*)%?/gi, name: 'Margin' }
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const value = match[1].replace(/,/g, '');
        const unit = match[2] || (pattern.name.includes('Rate') || pattern.name.includes('Share') || pattern.name.includes('Margin') ? '%' : '$');
        
        metrics.push({
          name: pattern.name,
          value: value,
          unit: unit,
          category: 'financial',
          source: 'secure-pattern-extraction'
        });
      }
    });
    
    return metrics;
  }

  // Extract time series data
  extractTimeSeriesFromText(text) {
    const timeSeries = [];
    const yearPattern = /(20\d{2})[:\s]*\$?([\d,]+\.?\d*)/g;
    const yearData = {};
    
    let match;
    while ((match = yearPattern.exec(text)) !== null) {
      const year = match[1];
      const value = match[2].replace(/,/g, '');
      
      if (!yearData[year]) {
        yearData[year] = [];
      }
      yearData[year].push(parseFloat(value));
    }
    
    const years = Object.keys(yearData).sort();
    if (years.length >= 2) {
      timeSeries.push({
        title: 'Annual Financial Data (Secure)',
        dataPoints: years.map(year => ({
          period: year,
          value: Math.max(...yearData[year]).toString()
        })),
        unit: '$',
        category: 'financial'
      });
    }
    
    return timeSeries;
  }
}

// Create singleton instance
const secureDataExtractor = new SecureDataExtractor();

module.exports = {
  extractSensitiveDataTables: (text, brandName) => secureDataExtractor.extractSensitiveDataTables(text, brandName),
  secureDataExtractor
}; 