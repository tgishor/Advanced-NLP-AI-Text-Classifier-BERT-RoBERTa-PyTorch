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
    
  } catch (error) {
    console.log(`❌ Error parsing PDF: ${error.message}`);
    
    if (error.message.includes('password')) {
      console.log(`🔒 PDF is password protected`);
    } else if (error.message.includes('Invalid PDF')) {
      console.log(`📄 PDF file appears to be corrupted`);
    }
  }
}

// Check the specific file mentioned in logs
async function main() {
  console.log('🔍 PDF Diagnostics Tool\n');
  
  // Look for uploaded PDFs
  const uploadsDir = path.join(__dirname, 'server', 'uploads');
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    console.log(`📁 Found ${pdfFiles.length} PDF files in uploads:`);
    pdfFiles.forEach(f => console.log(`   • ${f}`));
    
    // Diagnose the problematic file if found
    const problematicFile = pdfFiles.find(f => f.includes('cococola') || f.includes('coca'));
    
    if (problematicFile) {
      console.log(`\n🎯 Diagnosing problematic file: ${problematicFile}`);
      await diagnosePDF(path.join(uploadsDir, problematicFile));
    } else {
      console.log(`\n🔍 No coca-cola PDF found. Diagnosing most recent PDF...`);
      if (pdfFiles.length > 0) {
        const latestPdf = pdfFiles[pdfFiles.length - 1];
        await diagnosePDF(path.join(uploadsDir, latestPdf));
      }
    }
  } else {
    console.log(`❌ Uploads directory not found: ${uploadsDir}`);
  }
  
  // Test sample documents
  const sampleDir = path.join(__dirname, 'sample-documents');
  if (fs.existsSync(sampleDir)) {
    const sampleFiles = fs.readdirSync(sampleDir).filter(f => f.toLowerCase().endsWith('.pdf'));
    if (sampleFiles.length > 0) {
      console.log(`\n📋 Testing sample document: ${sampleFiles[0]}`);
      await diagnosePDF(path.join(sampleDir, sampleFiles[0]));
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnosePDF }; 