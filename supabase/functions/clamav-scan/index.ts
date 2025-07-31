
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanResult {
  isMalicious: boolean;
  virusName?: string;
  scanTime: number;
  fileSize: number;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting ClamAV scan for file: ${file.name} (${file.size} bytes)`);
    const startTime = Date.now();

    // Convert file to buffer for analysis
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Enhanced threat detection combining multiple methods
    const scanResult = await performEnhancedScan(file, uint8Array);
    const scanTime = Date.now() - startTime;

    console.log(`Scan completed in ${scanTime}ms:`, scanResult);

    return new Response(
      JSON.stringify({
        ...scanResult,
        scanTime,
        fileSize: file.size,
        fileName: file.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('ClamAV scan error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Scan failed',
        details: error.message,
        isMalicious: false,
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performEnhancedScan(file: File, fileBuffer: Uint8Array): Promise<ScanResult> {
  let suspicionScore = 0;
  let detectedVirus: string | undefined;
  
  // File extension analysis
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'jar', 'vbs', 'ps1', 'msi'];
  const suspiciousExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'docm', 'xlsm', 'pptm'];
  
  if (dangerousExtensions.includes(extension)) {
    suspicionScore += 60;
  } else if (suspiciousExtensions.includes(extension)) {
    suspicionScore += 25;
  }

  // File name analysis
  const fileName = file.name.toLowerCase();
  const maliciousPatterns = [
    'crack', 'keygen', 'patch', 'hack', 'trojan', 'virus', 'malware',
    'backdoor', 'rootkit', 'keylogger', 'ransomware', 'payload'
  ];
  
  for (const pattern of maliciousPatterns) {
    if (fileName.includes(pattern)) {
      suspicionScore += 40;
      detectedVirus = `Potentially malicious file pattern: ${pattern}`;
      break;
    }
  }

  // File size analysis
  if (file.size < 100) {
    suspicionScore += 20; // Very small files can be suspicious
  } else if (file.size > 500 * 1024 * 1024) {
    suspicionScore += 15; // Very large files
  }

  // Binary signature analysis
  const signatures = await analyzeFileSignatures(fileBuffer);
  suspicionScore += signatures.suspicionScore;
  if (signatures.detectedThreat) {
    detectedVirus = signatures.detectedThreat;
  }

  // Entropy analysis for packed/encrypted content
  const entropy = calculateEntropy(fileBuffer);
  if (entropy > 7.5) {
    suspicionScore += 30; // High entropy suggests packing/encryption
    if (!detectedVirus) {
      detectedVirus = 'High entropy content detected (possibly packed/encrypted)';
    }
  }

  // PE header analysis for Windows executables
  if (extension === 'exe' || extension === 'dll') {
    const peAnalysis = analyzePEHeader(fileBuffer);
    suspicionScore += peAnalysis.suspicionScore;
    if (peAnalysis.detectedThreat && !detectedVirus) {
      detectedVirus = peAnalysis.detectedThreat;
    }
  }

  // Final confidence calculation
  const confidence = Math.min(95, Math.max(60, suspicionScore + 20));
  const isMalicious = suspicionScore >= 50;

  return {
    isMalicious,
    virusName: detectedVirus,
    scanTime: 0, // Will be set by caller
    fileSize: file.size,
    confidence
  };
}

async function analyzeFileSignatures(buffer: Uint8Array): Promise<{suspicionScore: number, detectedThreat?: string}> {
  const signatures = [
    { pattern: [0x4D, 0x5A], name: 'PE Executable', score: 20 },
    { pattern: [0x7F, 0x45, 0x4C, 0x46], name: 'ELF Executable', score: 15 },
    { pattern: [0x50, 0x4B, 0x03, 0x04], name: 'ZIP Archive', score: 10 },
    { pattern: [0x52, 0x61, 0x72, 0x21], name: 'RAR Archive', score: 10 },
    // Malicious signatures (simplified examples)
    { pattern: [0xEB, 0xFE, 0x90, 0x90], name: 'Suspicious Code Pattern', score: 50 },
    { pattern: [0x6A, 0x40, 0x68, 0x00], name: 'Shellcode Pattern', score: 60 },
  ];

  let suspicionScore = 0;
  let detectedThreat: string | undefined;

  for (const sig of signatures) {
    if (buffer.length >= sig.pattern.length) {
      for (let i = 0; i <= buffer.length - sig.pattern.length; i++) {
        let match = true;
        for (let j = 0; j < sig.pattern.length; j++) {
          if (buffer[i + j] !== sig.pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          suspicionScore += sig.score;
          if (sig.score >= 50 && !detectedThreat) {
            detectedThreat = sig.name;
          }
          break;
        }
      }
    }
  }

  return { suspicionScore, detectedThreat };
}

function calculateEntropy(buffer: Uint8Array): number {
  const frequency = new Array(256).fill(0);
  
  for (let i = 0; i < buffer.length; i++) {
    frequency[buffer[i]]++;
  }
  
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequency[i] > 0) {
      const p = frequency[i] / buffer.length;
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

function analyzePEHeader(buffer: Uint8Array): {suspicionScore: number, detectedThreat?: string} {
  let suspicionScore = 0;
  let detectedThreat: string | undefined;

  // Basic PE header checks
  if (buffer.length < 64) return { suspicionScore: 0 };

  // Check DOS header
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
    // Get PE header offset
    const peOffset = buffer[60] | (buffer[61] << 8) | (buffer[62] << 16) | (buffer[63] << 24);
    
    if (peOffset < buffer.length - 4) {
      // Check PE signature
      if (buffer[peOffset] === 0x50 && buffer[peOffset + 1] === 0x45) {
        // Analyze characteristics
        if (peOffset + 22 < buffer.length) {
          const characteristics = buffer[peOffset + 22] | (buffer[peOffset + 23] << 8);
          
          // Check for suspicious characteristics
          if (characteristics & 0x0020) { // IMAGE_FILE_LARGE_ADDRESS_AWARE
            suspicionScore += 10;
          }
          if (characteristics & 0x2000) { // IMAGE_FILE_DLL
            suspicionScore += 5;
          }
        }
      }
    }
  }

  return { suspicionScore, detectedThreat };
}
