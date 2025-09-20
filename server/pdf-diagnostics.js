const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function diagnosePDF(filePath) {
  console.log(`🔍 Diagnosing PDF: ${filePath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`📄 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Try to read PDF
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`📖 PDF buffer size: ${dataBuffer.length} bytes`);
    
    // Parse PDF
    const parsed = await pdfParse(dataBuffer);
    
    console.log(`\n📊 PDF Analysis Results:`);
    console.log(`  📄 Pages: ${parsed.numpages}`);
    console.log(`  📝 Text length: ${parsed.text.length} characters`);
    console.log(`  🔤 Text preview (first 200 chars):`);
    console.log(`     "${parsed.text.substring(0, 200)}..."`);
    
    if (parsed.text.length < 100) {
      console.log(`\n⚠️  WARNING: Very little text extracted!`);
      console.log(`   This could be due to:`);
      console.log(`   • Scanned images instead of text`);
      console.log(`   • Password protection`);
      console.log(`   • PDF corruption`);
      console.log(`   • Complex formatting`);
    }
    
    // Check for common issues
    if (parsed.text.includes('password') || parsed.text.includes('encrypted')) {
      console.log(`🔒 PDF may be password protected`);
    }
    
    if (parsed.text.trim().length === 0) {
      console.log(`❌ No text extracted - PDF likely contains only images`);
    }
    
    return {
      pages: parsed.numpages,
      textLength: parsed.text.length,
      text: parsed.text,
      fileSize: stats.size
    };
    
  } catch (error) {
    console.log(`❌ Error parsing PDF: ${error.message}`);
    
    if (error.message.includes('password')) {
      console.log(`🔒 PDF is password protected`);
    } else if (error.message.includes('Invalid PDF')) {
      console.log(`📄 PDF file appears to be corrupted`);
    }
    
    return null;
  }
}

// Check the specific file mentioned in logs
async function main() {
  console.log('🔍 PDF Diagnostics Tool\n');
  
  // Look for uploaded PDFs in server/uploads
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    console.log(`📁 Found ${pdfFiles.length} PDF files in uploads:`);
    pdfFiles.forEach(f => console.log(`   • ${f}`));
    
    if (pdfFiles.length === 0) {
      console.log(`📋 No PDF files found in uploads directory`);
      return;
    }
    
    // Diagnose the problematic file if found
    const problematicFile = pdfFiles.find(f => f.includes('cococola') || f.includes('coca'));
    
    if (problematicFile) {
      console.log(`\n🎯 Diagnosing problematic file: ${problematicFile}`);
      const result = await diagnosePDF(path.join(uploadsDir, problematicFile));
      
      if (result && result.textLength < 50) {
        console.log(`\n💡 SOLUTIONS for low text extraction:`);
        console.log(`   1. Try using a different PDF (with searchable text)`);
        console.log(`   2. If it's a scanned document, use OCR software first`);
        console.log(`   3. Try converting to text file manually`);
        console.log(`   4. Use the sample documents for testing`);
      }
    } else {
      console.log(`\n🔍 No coca-cola PDF found. Diagnosing most recent PDF...`);
      if (pdfFiles.length > 0) {
        // Sort by modification time to get the most recent
        const filesWithStats = pdfFiles.map(f => ({
          name: f,
          path: path.join(uploadsDir, f),
          mtime: fs.statSync(path.join(uploadsDir, f)).mtime
        }));
        filesWithStats.sort((a, b) => b.mtime - a.mtime);
        
        const latestPdf = filesWithStats[0];
        console.log(`📄 Most recent: ${latestPdf.name} (${latestPdf.mtime.toISOString()})`);
        await diagnosePDF(latestPdf.path);
      }
    }
  } else {
    console.log(`❌ Uploads directory not found: ${uploadsDir}`);
  }
  
  // Test sample documents
  const sampleDir = path.join(__dirname, '..', 'sample-documents');
  if (fs.existsSync(sampleDir)) {
    const sampleFiles = fs.readdirSync(sampleDir);
    const txtFiles = sampleFiles.filter(f => f.toLowerCase().endsWith('.txt'));
    
    if (txtFiles.length > 0) {
      console.log(`\n📋 Testing sample text document: ${txtFiles[0]}`);
      const samplePath = path.join(sampleDir, txtFiles[0]);
      const sampleText = fs.readFileSync(samplePath, 'utf-8');
      console.log(`  📝 Sample text length: ${sampleText.length} characters`);
      console.log(`  🔤 Sample preview: "${sampleText.substring(0, 100)}..."`);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnosePDF }; 