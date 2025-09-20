#!/usr/bin/env python3
"""
Standalone Test Script for Document Processing
Tests the exact same functions used in the Flask app without running the server
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path so we can import from app.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the exact functions from app.py
from app import (
    call_runpod_llama,
    process_full_document,
    validate_response_format,
    create_robust_fallback_response,
    format_business_metrics,
    create_fallback_summary,
    generate_plots_from_metrics
)

def test_document_processing(document_text):
    """
    Test the complete document processing pipeline
    This mimics exactly what happens in the Flask endpoint
    """
    print("🚀 Starting Document Processing Test")
    print(f"📄 Document length: {len(document_text)} characters")
    print("=" * 60)
    
    try:
        # Step 1: Process the document (same as Flask endpoint)
        print("📡 Processing document with AI...")
        result = process_full_document(document_text)
        
        # Step 2: Validate response format (same as Flask endpoint)
        print("🔍 Validating response format...")
        if isinstance(result, tuple):
            response_data = result[0]
        else:
            response_data = result
            
        validated_response = validate_response_format(response_data)
        
        # Step 3: Display results
        print("\n✅ PROCESSING COMPLETE!")
        print("=" * 60)
        
        print(f"\n📋 SUMMARY:")
        print(f"   {validated_response.get('summary', 'N/A')[:200]}...")
        
        print(f"\n🔑 KEYWORDS ({len(validated_response.get('keywords', []))}):")
        for i, keyword in enumerate(validated_response.get('keywords', [])[:5], 1):
            print(f"   {i}. {keyword}")
        
        print(f"\n📊 METRICS ({len(validated_response.get('metrics', []))}):")
        for i, metric in enumerate(validated_response.get('metrics', [])[:3], 1):
            print(f"   {i}. {metric.get('name', 'Unknown')}: {metric.get('value', 'N/A')}")
        
        print(f"\n💡 INSIGHTS:")
        print(f"   {validated_response.get('insights', 'N/A')[:150]}...")
        
        print(f"\n📈 PLOT DATA ({len(validated_response.get('plotData', []))}):")
        for i, plot in enumerate(validated_response.get('plotData', []), 1):
            print(f"   {i}. {plot.get('title', 'Unknown Plot')} ({plot.get('type', 'unknown')})")
        
        print(f"\n🔒 PROCESSING INFO:")
        print(f"   - Processed Locally: {validated_response.get('processedLocally', False)}")
        print(f"   - AI Processing: {validated_response.get('processedWithAI', False)}")
        print(f"   - Processing Mode: {validated_response.get('processing_mode', 'unknown')}")
        print(f"   - Timestamp: {validated_response.get('timestamp', 'N/A')}")
        
        # Step 4: Return the full response (same format as Flask would return)
        return validated_response
        
    except Exception as e:
        print(f"❌ ERROR during processing: {str(e)}")
        fallback_response = create_robust_fallback_response(document_text, str(e))
        print("\n🔄 FALLBACK RESPONSE:")
        print(json.dumps(fallback_response, indent=2))
        return fallback_response

def test_runpod_connection():
    """Test RunPod connection before processing documents"""
    print("🧪 Testing RunPod Connection...")
    test_result = call_runpod_llama("Respond with: RunPod working correctly")
    
    if "Error:" not in test_result:
        print("✅ RunPod connection successful!")
        print(f"📝 Response: {test_result[:100]}...")
        return True
    else:
        print(f"❌ RunPod connection failed: {test_result}")
        return False

def main():
    """Main test function"""
    print("🔬 AI Document Processing Test Suite")
    print("=" * 60)
    
    # Test 1: RunPod Connection
    if not test_runpod_connection():
        print("\n⚠️ RunPod connection failed. Proceeding with test but AI processing may fail.")
    
    print("\n" + "=" * 60)
    print("📝 DOCUMENT INPUT OPTIONS:")
    print("1. Enter document text directly")
    print("2. Load from sample file")
    print("3. Use built-in test document")
    
    choice = input("\nChoose option (1-3): ").strip()
    
    document_text = ""
    
    if choice == "1":
        print("\n📝 Enter your document text (press Ctrl+Z then Enter on Windows, or Ctrl+D on Unix when done):")
        try:
            document_text = sys.stdin.read().strip()
        except KeyboardInterrupt:
            print("\n❌ Input cancelled")
            return
            
    elif choice == "2":
        file_path = r"C:\Users\tgish\OneDrive\Desktop\MQ - AI\1. Current Semi\COMP8420 Advanced NLP\Major Project\AI-Sales-Deck-Generator\AI-Sales-Deck-Generator\server\uploads\1750207760033-cchbc-iar-2024.pdf"
        try:
            # For PDF files, we need to extract text (you'll need to install PyPDF2: pip install PyPDF2)
            if file_path.lower().endswith('.pdf'):
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        document_text = ""
                        for page in reader.pages:
                            document_text += page.extract_text() + "\n"
                    print(f"✅ Extracted {len(document_text)} characters from PDF")
                except ImportError:
                    print("❌ PyPDF2 not installed. Install with: pip install PyPDF2")
                    return
            else:
                with open(file_path, 'r', encoding='utf-8') as f:
                    document_text = f.read()
                print(f"✅ Loaded {len(document_text)} characters from {file_path}")
        except Exception as e:
            print(f"❌ Error loading file: {e}")
            return
            
    elif choice == "3":
        document_text = """
        TechCorp Inc. Annual Business Report 2024
        
        Executive Summary:
        TechCorp has achieved remarkable growth in 2024, with annual revenue reaching $850 million, representing a 23% increase from the previous year. Our market share in the enterprise software sector has expanded to 15.2%, making us one of the top 5 players in the industry.
        
        Key Financial Metrics:
        - Annual Revenue: $850 million (23% growth)
        - Net Profit: $127 million (18% growth)
        - Customer Acquisition: 2,847 new enterprise clients
        - Customer Retention Rate: 94.3%
        - Market Share: 15.2% in enterprise software
        
        Strategic Initiatives:
        Our AI-powered platform has been adopted by Fortune 500 companies, driving digital transformation across multiple industries. We've invested $45 million in R&D, focusing on machine learning capabilities and cloud infrastructure.
        
        Competitive Advantages:
        - Advanced AI algorithms with 99.2% accuracy
        - Scalable cloud architecture supporting 10M+ concurrent users  
        - Strategic partnerships with Microsoft, Amazon, and Google
        - Industry-leading customer support with 24/7 availability
        
        Market Position:
        TechCorp is positioned as an innovation leader in the enterprise AI space, with strong competitive differentiation through our proprietary machine learning models and comprehensive platform approach.
        """
        print("✅ Using built-in test document")
    
    else:
        print("❌ Invalid choice")
        return
    
    if not document_text.strip():
        print("❌ No document text provided")
        return
    
    print("\n" + "=" * 60)
    
    # Process the document
    result = test_document_processing(document_text)
    
    print("\n" + "=" * 60)
    print("🔍 FULL JSON RESPONSE (for debugging):")
    print(json.dumps(result, indent=2))
    
    print("\n" + "=" * 60)
    print("✅ Test completed! You can now analyze the results and adjust functions in app.py")

if __name__ == "__main__":
    main() 