"use client";

import React, { useState } from "react";
import { 
  Mic, Camera, Upload, ShieldCheck, CheckCircle2, 
  FileText, Sparkles, RefreshCw, Eye, EyeOff, 
  User, Lock, ArrowRight, Volume2, Globe, Building2
} from "lucide-react";

export default function JanSetuDashboard() {
  // Navigation & Dialect State
  const [activeDialect, setActiveDialect] = useState<string>("bundeli");
  const [activeTab, setActiveTab] = useState<"voice" | "scanner" | "selfie" | "review">("voice");

  // Voice Assistant State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceProgress, setVoiceProgress] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");
  const [detectedScheme, setDetectedScheme] = useState<string | null>(null);

  // Document Scanner State
  const [scannedDoc, setScannedDoc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [piiMasked, setPiiMasked] = useState<boolean>(true);

  // Live Selfie Studio State
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [selfieReady, setSelfieReady] = useState<boolean>(false);

  // Form State
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [appId, setAppId] = useState<string>("");

  // Handle Voice Recording Simulation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTranscript("");
      setDetectedScheme(null);
      setVoiceProgress(0);

      const interval = setInterval(() => {
        setVoiceProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRecording(false);
            if (activeDialect === "bundeli") {
              setTranscript("मोय लाडली बहना योजना को फॉर्म भरना है, किते जमा होइ?");
            } else if (activeDialect === "malvi") {
              setTranscript("म्हाने लाडली बहना योजना रो फॉर्म भरनो छै, कांई-कांई कागज़ लागसी?");
            } else {
              setTranscript("मोका लाडली बहना योजना का फॉर्म भरना है, मदद करा।");
            }
            setDetectedScheme("लाडली बहना योजना (Ladli Behna Yojana) - Scheme ID #MP-LBY-2026");
            return 100;
          }
          return prev + 25;
        });
      }, 500);
    }
  };

  // Handle Document Upload Simulation
  const handleDocScan = (type: string) => {
    setIsScanning(true);
    setScannedDoc(null);
    setTimeout(() => {
      setIsScanning(false);
      setScannedDoc(type);
    }, 1500);
  };

  // Handle Selfie Studio Simulation
  const handleSelfieCapture = () => {
    setIsCapturing(true);
    setSelfieReady(false);
    setTimeout(() => {
      setIsCapturing(false);
      setSelfieReady(true);
    }, 1800);
  };

  // Handle Final Submission
  const handleSubmit = () => {
    const randomId = "MP2026-NM-" + Math.floor(100000 + Math.random() * 900000);
    setAppId(randomId);
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Banner / Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">Jan-Setu AI <span className="text-emerald-400 font-normal text-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">जन-सेतु</span></h1>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">Team NovaMind</span>
            </div>
            <p className="text-xs text-slate-400">MPOnline Hackathon 2026 | Sovereign Dialect & Document AI Middleware</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Security & Compliance Badges */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 Compliant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <span className="text-slate-400 font-medium">Bhashini Dialect:</span>
            <select 
              value={activeDialect} 
              onChange={(e) => setActiveDialect(e.target.value)}
              className="bg-slate-900 text-emerald-400 font-semibold rounded px-2 py-1 outline-none border border-slate-700"
            >
              <option value="bundeli">Bundeli (बुंदेली)</option>
              <option value="malvi">Malvi (मालवी)</option>
              <option value="bagheli">Bagheli (बघेली)</option>
              <option value="hindi">Standard Hindi (हिंदी)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* KPI / Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Processing Time</p>
              <p className="text-lg font-bold text-slate-100">15 min → <span className="text-emerald-400">2 min</span> (86% ↓)</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Voice AI Engine</p>
              <p className="text-lg font-bold text-slate-100">Bhashini Speech-to-Intent</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Privacy Architecture</p>
              <p className="text-lg font-bold text-slate-100">Zero Data Retention (ZDR)</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Kiosk Capacity</p>
              <p className="text-lg font-bold text-slate-100">7x Higher Operator Output</p>
            </div>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          <button 
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition ${
              activeTab === "voice" 
                ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 border-x border-slate-800" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>1. Voice Dialect AI (बोलकर आवेदन)</span>
          </button>

          <button 
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition ${
              activeTab === "scanner" 
                ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 border-x border-slate-800" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Zero-Knowledge Kagaaz Scanner</span>
          </button>

          <button 
            onClick={() => setActiveTab("selfie")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition ${
              activeTab === "selfie" 
                ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 border-x border-slate-800" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>3. Live Selfie Studio</span>
          </button>

          <button 
            onClick={() => setActiveTab("review")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition ${
              activeTab === "review" 
                ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 border-x border-slate-800" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Review & Direct Submit</span>
          </button>
        </div>

        {/* Tab 1: Voice Dialect Assistant */}
        {activeTab === "voice" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col items-center justify-center border border-slate-800/80 rounded-xl p-8 bg-slate-950/60 text-center relative overflow-hidden">
              <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Bhashini Speech API Active</span>
              </div>

              <div className="my-6">
                <button 
                  onClick={toggleRecording}
                  className={`relative p-7 rounded-full transition-all transform active:scale-95 shadow-2xl ${
                    isRecording 
                      ? "bg-red-500 text-white shadow-red-500/40 animate-pulse" 
                      : "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 hover:shadow-emerald-500/30"
                  }`}
                >
                  <Mic className="w-10 h-10 stroke-[2.5]" />
                  {isRecording && (
                    <span className="absolute -inset-3 rounded-full border-2 border-red-500 animate-ping opacity-75"></span>
                  )}
                </button>
              </div>

              <h3 className="font-bold text-lg text-white">
                {isRecording ? "Listening in Local Dialect..." : "Click Mic & Speak in Regional Dialect"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Active Dialect: <span className="text-emerald-400 font-semibold capitalize">{activeDialect}</span>. Speak naturally without drop-down menus or typing.
              </p>

              {isRecording && (
                <div className="w-full max-w-xs mt-6 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Processing Speech...</span>
                    <span>{voiceProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${voiceProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Transcript & Intent Box */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Speech Transcript (आवाज़ ट्रांसक्रिप्ट)</span>
                </h4>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[120px] flex items-center justify-center text-center">
                  {transcript ? (
                    <p className="text-lg font-medium text-emerald-300 italic">"{transcript}"</p>
                  ) : (
                    <p className="text-sm text-slate-500">Tap mic and speak to see live speech-to-intent conversion...</p>
                  )}
                </div>
              </div>

              {detectedScheme && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Detected Welfare Scheme (योजना पहचान)</span>
                  </div>
                  <p className="text-slate-100 font-semibold">{detectedScheme}</p>
                  <p className="text-xs text-slate-400">Matched with 98.7% confidence via Bhashini NLU classifier.</p>
                  
                  <button 
                    onClick={() => setActiveTab("scanner")}
                    className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Proceed to Document Scanner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Zero-Knowledge Kagaaz Scanner */}
        {activeTab === "scanner" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Zero-Knowledge Kagaaz Scanner (Gemini Vision AI)</span>
                </h3>
                <p className="text-xs text-slate-400">Auto-identifies Aadhaar, Samagra ID, & Income certificates without drop-downs or manual typing.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPiiMasked(!piiMasked)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    piiMasked 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {piiMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{piiMasked ? "PII Masking Active (XXXX-XXXX-8921)" : "Raw Preview"}</span>
                </button>
              </div>
            </div>

            {/* Document Selection / Upload Simulation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleDocScan("Aadhaar Card")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl text-left transition space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white group-hover:text-emerald-400">Scan Aadhaar Card</span>
                  <Upload className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">Auto-detects Name, DOB, & Redacts 12-digit UID</p>
              </button>

              <button 
                onClick={() => handleDocScan("Samagra ID")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl text-left transition space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white group-hover:text-emerald-400">Scan Samagra ID</span>
                  <Upload className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">Validates MP Family ID & Member Mapping</p>
              </button>

              <button 
                onClick={() => handleDocScan("Income Certificate")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl text-left transition space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white group-hover:text-emerald-400">Scan Income Certificate</span>
                  <Upload className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400">Verifies Annual Income Limit & Tehsildar Seal</p>
              </button>
            </div>

            {/* Scanning Progress & Preview */}
            {isScanning && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-semibold text-white">Gemini Vision AI Inspecting Physical Certificate...</p>
                <p className="text-xs text-slate-500">Auto-classifying layout & applying Zero-Knowledge PII redaction layer.</p>
              </div>
            )}

            {scannedDoc && !isScanning && (
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Document Classification</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">99.4% Match</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">{scannedDoc} Detected</h4>
                  
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Applicant Name:</span>
                      <span className="font-bold text-white">Smt. Sunita Devi</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Document Number:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {piiMasked ? "XXXX-XXXX-8921" : "9812-3456-8921"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Seal:</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Authentic (Government Seal Verified)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200">DPDP Act 2023 Security Status:</p>
                    <p className="text-slate-400">Document processed strictly in ephemeral RAM memory using Gemini Enterprise ZDR (Zero Data Retention) policy. No permanent copy stored.</p>
                  </div>

                  <button 
                    onClick={() => setActiveTab("selfie")}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Proceed to Live Selfie Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Live Selfie Studio */}
        {activeTab === "selfie" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Instant Live-Selfie Studio (पासपोर्ट फोटो स्टूडियो)</span>
              </h3>
              <p className="text-xs text-slate-400">Auto-crops phone captures into official 3.5cm x 4.5cm white-background photos conforming to GIGW standards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camera Frame */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center relative min-h-[260px]">
                <div className="w-32 h-40 border-2 border-dashed border-emerald-400/60 rounded-full flex items-center justify-center relative mb-4">
                  <User className="w-16 h-16 text-slate-600" />
                  <span className="absolute text-[10px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono -bottom-2">Align Face</span>
                </div>

                <button 
                  onClick={handleSelfieCapture}
                  disabled={isCapturing}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? "Processing Image..." : "Capture & Auto-Format Photo"}</span>
                </button>
              </div>

              {/* Formatted Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Official Passport Output Preview</h4>
                  
                  {selfieReady ? (
                    <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="w-24 h-32 bg-white rounded border-2 border-slate-300 flex items-center justify-center relative shadow">
                        <User className="w-16 h-16 text-slate-800" />
                        <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 text-[8px] font-extrabold px-1 rounded">3.5x4.5cm</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <p className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> GIGW 3.0 Standard Matched
                        </p>
                        <p className="text-slate-300">Background: <span className="text-white font-medium">Pure White (RGB 255)</span></p>
                        <p className="text-slate-300">Face Coverage: <span className="text-white font-medium">78% Auto-Aligned</span></p>
                        <p className="text-slate-300">Resolution: <span className="text-white font-medium">300 DPI Ready</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                      Click "Capture & Auto-Format Photo" to generate passport photo instantly.
                    </div>
                  )}
                </div>

                {selfieReady && (
                  <button 
                    onClick={() => setActiveTab("review")}
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Proceed to Final Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Final Review & Submit */}
        {activeTab === "review" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Application Final Review & MPOnline Direct Submit</span>
              </h3>
              <p className="text-xs text-slate-400">All data auto-aggregated from Voice Dialect AI and Document Scanner with zero manual typing.</p>
            </div>

            {!formSubmitted ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-400 border-b border-slate-800 pb-2">Auto-Filled Application Summary</h4>
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Target Welfare Scheme:</span>
                    <span className="font-bold text-white">Ladli Behna Yojana (लाडली बहना)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Applicant Name:</span>
                    <span className="font-bold text-white">Smt. Sunita Devi</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Aadhaar (Redacted):</span>
                    <span className="font-mono font-bold text-emerald-400">XXXX-XXXX-8921</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Dialect Voice Consent:</span>
                    <span className="text-emerald-400 font-medium">Verified (Bundeli Audio Stamp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kiosk Processing Time:</span>
                    <span className="font-bold text-emerald-400">1 minute 42 seconds</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Zero Data Retention (ZDR) Assurance</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Upon submission, all temporary voice buffers and document image caches will be permanently purged from RAM memory in accordance with the DPDP Act 2023.
                    </p>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/20"
                  >
                    <span>Submit Application to MPOnline Portal</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Application Successfully Submitted!</h3>
                  <p className="text-xs text-slate-400 mt-1">Directly integrated with MPOnline Gateway via Sovereign Middleware</p>
                </div>

                <div className="inline-block bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1 font-mono">
                  <p className="text-slate-400">Application Reference ID:</p>
                  <p className="text-lg font-bold text-emerald-400 tracking-wider">{appId}</p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setFormSubmitted(false);
                      setTranscript("");
                      setDetectedScheme(null);
                      setScannedDoc(null);
                      setSelfieReady(false);
                      setActiveTab("voice");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-5 rounded-lg text-xs transition"
                  >
                    Start New Application
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Jan-Setu AI (जन-सेतु) | Developed by <span className="text-slate-300 font-semibold">Team NovaMind</span> for MPOnline Hackathon 2026</p>
        <p>Grounded in MeitY Bhashini, Gemini Enterprise ZDR, & India DPDP Act 2023 Guidelines</p>
      </footer>
    </div>
  );
}
