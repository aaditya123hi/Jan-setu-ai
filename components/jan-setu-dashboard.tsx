'use client'

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  Fingerprint,
  Headphones,
  Languages,
  LockKeyhole,
  Mic,
  MicOff,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Volume2,
  X,
} from 'lucide-react'

const languages = ['Hindi', 'Bundeli', 'Malvi', 'Bagheli', 'English']

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <ShieldCheck size={23} strokeWidth={2.3} />
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>
}

function SelfieStudio({ onClose }: { onClose: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo)
    }
  }, [photo])

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setReady(false)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="selfie-modal" role="dialog" aria-modal="true" aria-labelledby="selfie-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close selfie studio">
          <X size={21} />
        </button>
        <div className="modal-heading-icon"><Camera size={22} /></div>
        <p className="section-label">PHOTO STUDIO</p>
        <h2 id="selfie-title">पासपोर्ट फोटो स्टूडियो</h2>
        <p className="modal-copy">Choose a clear, front-facing photo. This demo shows a passport-style preview on a white background.</p>
        <div className="passport-preview" aria-label={photo ? 'Passport photo preview' : 'Passport photo preview placeholder'}>
          {photo ? <img src={photo} alt="Your selected selfie preview" /> : <UserRound size={58} strokeWidth={1.4} />}
          {ready && <span className="photo-ready"><Check size={14} /> Preview ready</span>}
        </div>
        <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" capture="user" onChange={choosePhoto} />
        <button className="button button-primary modal-action" type="button" onClick={() => fileRef.current?.click()}>
          <Camera size={19} /> {photo ? 'Choose another photo' : 'Take or choose a selfie'}
        </button>
        {photo && <button className="button button-outline modal-action" type="button" onClick={() => setReady(true)}>Create preview</button>}
        <p className="modal-footnote"><LockKeyhole size={14} /> Photo stays on this device in this demo.</p>
      </section>
    </div>
  )
}

function FeatureHeading({ icon, eyebrow, title, subtitle }: { icon: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="feature-heading">
      <div className="feature-icon">{icon}</div>
      <div>
        <p className="feature-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="feature-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

export default function JanSetuDashboard() {
  const [language, setLanguage] = useState('Hindi')
  const [operatorMode, setOperatorMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceMessage, setVoiceMessage] = useState('')
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [consent, setConsent] = useState<boolean | null>(null)
  const [selfieOpen, setSelfieOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<{ start: () => void; stop: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null } | null>(null)

  function selectFile(file?: File) {
    if (!file) return
    setFileName(file.name)
    setActiveStep(2)
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0])
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setVoiceMessage('आवाज़ रिकॉर्डिंग बंद हो गई।')
      return
    }
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setVoiceMessage('इस ब्राउज़र में voice input उपलब्ध नहीं है। नीचे लिखकर जारी रखें।')
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = language === 'English' ? 'en-IN' : 'hi-IN'
    recognition.interimResults = true
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join('')
      setTranscript(text)
      setVoiceMessage('आपकी बात यहाँ दिखाई देगी।')
      if (text) setActiveStep(1)
    }
    recognition.onerror = () => {
      setIsListening(false)
      setVoiceMessage('माइक चालू नहीं हो पाया। कृपया अनुमति जाँचें या लिखकर जारी रखें।')
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setVoiceMessage('सुन रहे हैं… अब अपनी बात बोलें।')
    setIsListening(true)
    recognition.start()
  }

  function applyScheme(name: string) {
    setTranscript(`मुझे ${name} के लिए आवेदन करना है।`)
    setVoiceMessage('आवेदन का तरीका आपकी चुनी हुई भाषा में दिखाया जाएगा।')
    setActiveStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Jan-Setu AI home">
          <BrandMark />
          <span><strong>Jan-Setu AI</strong><small>जन-सेतु • मध्य प्रदेश</small></span>
        </a>
        <div className="topbar-right">
          <div className="trust-pill"><LockKeyhole size={14} /><span>Prototype demo</span></div>
          <label className="language-select-wrap">
            <Languages size={17} aria-hidden="true" />
            <span className="visually-hidden">Choose language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languages.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>
          <div className="mode-switch" role="group" aria-label="Choose dashboard view">
            <button type="button" className={!operatorMode ? 'mode-active' : ''} aria-label="Citizen view" aria-pressed={!operatorMode} onClick={() => setOperatorMode(false)}>Citizen</button>
            <button type="button" className={operatorMode ? 'mode-active' : ''} aria-label="MPOnline Kiosk Operator view" aria-pressed={operatorMode} onClick={() => setOperatorMode(true)}>Kiosk</button>
          </div>
        </div>
      </header>

      <div className="page-layout" id="home">
        <aside className="sidebar" aria-label="Dashboard navigation">
          <div className="sidebar-caption">YOUR SERVICES</div>
          <a className="side-link side-link-active" href="#voice"><span className="side-link-icon"><Mic size={18} /></span><span>बोलकर शुरुआत करें<small>Voice assistant</small></span></a>
          <a className="side-link" href="#documents"><span className="side-link-icon"><ScanLine size={18} /></span><span>कागज़ स्कैन करें<small>Document scanner</small></span></a>
          <a className="side-link" href="#schemes"><span className="side-link-icon"><Sparkles size={18} /></span><span>योजनाएँ खोजें<small>Find schemes</small></span></a>
          <div className="sidebar-bottom">
            <div className="help-card"><div className="help-card-icon"><Headphones size={18} /></div><strong>मदद चाहिए?</strong><p>अपनी भाषा चुनें और हम साथ चलेंगे।</p><button type="button" onClick={() => setVoiceMessage('सहायता के लिए अपने नज़दीकी MPOnline कियोस्क पर जाएँ।')}>सहायता देखें <ArrowRight size={14} /></button></div>
            <div className="state-note"><span className="state-dot" /> मध्य प्रदेश नागरिक सेवा</div>
          </div>
        </aside>

        <section className="content-area" aria-label="Jan-Setu services">
          <div className="welcome-row">
            <div><p className="welcome-kicker">{operatorMode ? 'MPONLINE KIOSK OPERATOR VIEW' : 'NAMASTE • NAMASTE'}</p><h1>नमस्ते, <span>आपका स्वागत है</span></h1><p className="welcome-subtitle">{operatorMode ? 'नागरिक की सहायता के लिए भाषा चुनें और आवेदन के कदम साथ-साथ पूरे करें।' : 'सरकारी सेवाएँ, अब आपकी भाषा में। आज हम आपकी क्या मदद करें?'}</p></div>
            <div className="today-card"><span className="today-icon"><BadgeCheck size={19} /></span><span><strong>{operatorMode ? 'कियोस्क सहायता मोड' : 'आपके साथ, हर कदम'}</strong><small>सरल • सुरक्षित • सबके लिए</small></span></div>
          </div>

          <section className="voice-panel" id="voice" aria-labelledby="voice-title">
            <div className="voice-panel-content">
              <div className="voice-copy">
                <div className="live-label"><span className="live-dot" /> VOICE-FIRST ASSISTANT</div>
                <h2 id="voice-title">अपनी भाषा में बोलें<br /><span>और फॉर्म भरें</span></h2>
                <p>Talk in your local dialect. We’ll help you take the next step.</p>
                <div className="voice-languages"><span><Volume2 size={14} /> बोलने की भाषा</span>{[language, ...(language === 'Hindi' ? ['Bundeli', 'Malvi'] : [])].map((item, index) => <span className="dialect-tag" key={`${item}-${index}`}>{item}</span>)}</div>
              </div>
              <div className="voice-action-area">
                <button className={`mic-button ${isListening ? 'mic-listening' : ''}`} type="button" onClick={toggleListening} aria-label={isListening ? 'Stop voice input' : 'Start voice input'} aria-pressed={isListening}>
                  {isListening && <span className="mic-ripple mic-ripple-one" aria-hidden="true" />}
                  {isListening && <span className="mic-ripple mic-ripple-two" aria-hidden="true" />}
                  {isListening ? <MicOff size={30} /> : <Mic size={32} />}
                </button>
                <strong>{isListening ? 'सुन रहे हैं…' : 'बोलने के लिए दबाएँ'}</strong>
                <span className="voice-hint">या नीचे अपनी बात लिखें</span>
              </div>
            </div>
            <div className="transcript-area">
              <div className="transcript-head"><span><span className="transcript-pulse" /> आपकी बात</span><span className="language-tag">{language} {language === 'Hindi' && '• Bundeli / Malvi'}</span></div>
              <label className="visually-hidden" htmlFor="voice-transcript">Voice transcript</label>
              <textarea id="voice-transcript" value={transcript} onChange={(event) => { setTranscript(event.target.value); setVoiceMessage(''); }} placeholder="जैसे: मुझे सरकारी योजना के लिए आवेदन करना है…" rows={2} />
              {voiceMessage && <p className="voice-status" role="status">{voiceMessage}</p>}
            </div>
          </section>

          <div className="section-title-row"><div><SectionLabel>YOUR NEXT STEPS</SectionLabel><h2>आज आप क्या करना चाहेंगे?</h2></div><span className="demo-note">DEMO EXPERIENCE</span></div>

          <div className="feature-grid">
            <article className="feature-card document-card" id="documents">
              <FeatureHeading icon={<ScanLine size={21} />} eyebrow="DOCUMENTS" title="स्मार्ट कागज़ स्कैनर" subtitle="Smart Kagaaz Scanner" />
              <div className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${fileName ? 'dropzone-uploaded' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}>
                <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*,.pdf" onChange={onFileChange} aria-label="Choose a document to upload" />
                <input ref={cameraInputRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={onFileChange} aria-label="Capture document with camera" />
                <div className="dropzone-icon">{fileName ? <FileCheck2 size={22} /> : <Upload size={21} />}</div>
                <strong>{fileName ? 'कागज़ चुना गया' : 'कागज़ यहाँ डालें'}</strong>
                <span className="file-name">{fileName || 'Aadhaar, Samagra ID या प्रमाण पत्र'}</span>
                <button className="button button-outline upload-button" type="button" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> {fileName ? 'दूसरा कागज़ चुनें' : 'फाइल चुनें'}</button>
              </div>
              <button className="camera-link" type="button" onClick={() => cameraInputRef.current?.click()}><Camera size={17} /> कैमरे से स्कैन करें <span>•</span> Scan with camera</button>
              <div className="document-preview">
                <div className="document-preview-top"><span>PRIVACY PREVIEW</span><span className="masked-badge"><LockKeyhole size={12} /> MASKED</span></div>
                <div className="sample-id"><div className="sample-emblem"><Fingerprint size={19} /></div><div className="sample-copy"><strong>आधार कार्ड <span>AADHAAR</span></strong><small>नाम • जन्मतिथि • पता</small><b>XXXX-XXXX-1234</b></div><ShieldCheck size={18} className="sample-shield" /></div>
                <p>आपकी पहचान के अंक छिपे रहते हैं।</p>
              </div>
              {fileName && <p className="upload-status" role="status"><Check size={14} /> {fileName} चुनी गई। इस demo में फ़ाइल अपलोड नहीं होती।</p>}
            </article>

            <article className="feature-card selfie-card">
              <FeatureHeading icon={<UserRound size={21} />} eyebrow="PHOTO STUDIO" title="पासपोर्ट फोटो स्टूडियो" subtitle="Live Selfie Passport Studio" />
              <div className="selfie-art" aria-hidden="true"><div className="selfie-art-sun" /><div className="selfie-frame"><div className="selfie-head" /><div className="selfie-body" /><span className="frame-corner frame-tl" /><span className="frame-corner frame-tr" /><span className="frame-corner frame-bl" /><span className="frame-corner frame-br" /></div><span className="selfie-art-label"><Sparkles size={13} /> White background</span></div>
              <p className="card-description">एक साफ़ selfie चुनें और पासपोर्ट फोटो जैसा preview देखें।</p>
              <button className="button button-primary full-button" type="button" onClick={() => setSelfieOpen(true)}><Camera size={18} /> सेल्फी स्टूडियो खोलें <ArrowRight size={17} /></button>
              <p className="privacy-micro"><LockKeyhole size={13} /> फोटो आपके डिवाइस पर रहती है</p>
            </article>

            <article className="feature-card schemes-card" id="schemes">
              <FeatureHeading icon={<Sparkles size={21} />} eyebrow="SCHEME MATCHING" title="आपके लिए योजनाएँ" subtitle="Proactive Scheme Matching" />
              <p className="card-description scheme-intro">इन लोकप्रिय योजनाओं के बारे में जानें। पात्रता की पुष्टि सरकारी पोर्टल पर करें।</p>
              <div className="scheme-list">
                <div className="scheme-row"><div className="scheme-mark scheme-mark-pink"><span>ल</span></div><div className="scheme-info"><strong>लाड़ली बहना योजना</strong><span>Ladli Behna Yojana</span></div><button type="button" className="scheme-button" onClick={() => applyScheme('लाड़ली बहना योजना')} aria-label="Apply for Ladli Behna Yojana by voice"><Mic size={16} /><span>बोलें</span></button></div>
                <div className="scheme-row"><div className="scheme-mark scheme-mark-green"><span>क</span></div><div className="scheme-info"><strong>पीएम-किसान सम्मान निधि</strong><span>PM-Kisan Samman Nidhi</span></div><button type="button" className="scheme-button" onClick={() => applyScheme('पीएम-किसान योजना')} aria-label="Apply for PM-Kisan by voice"><Mic size={16} /><span>बोलें</span></button></div>
              </div>
              <button type="button" className="all-schemes-link" onClick={() => setVoiceMessage('योजना की पात्रता की पुष्टि आधिकारिक पोर्टल या MPOnline कियोस्क पर करें।')}>सभी योजनाएँ देखें <ArrowRight size={15} /></button>
            </article>
          </div>

          <section className={`consent-banner ${consent === true ? 'consent-approved' : consent === false ? 'consent-cancelled' : ''}`} aria-labelledby="consent-title">
            <div className="consent-icon"><ShieldCheck size={25} /></div>
            <div className="consent-copy"><h2 id="consent-title">आपका डेटा, आपका अधिकार</h2><p>फ़ाइलें इस demo में डिवाइस से बाहर नहीं जातीं। कोई दस्तावेज़ सर्वर पर सेव या प्रोसेस नहीं होता।</p><span><LockKeyhole size={13} /> हर कदम पर आपकी सहमति ज़रूरी है</span></div>
            <div className="consent-actions"><button type="button" className="button button-consent" aria-pressed={consent === true} onClick={() => { setConsent(true); setActiveStep(3); }}> <Check size={17} /> हाँ, सहमति है</button><button type="button" className="cancel-consent" aria-pressed={consent === false} onClick={() => { setConsent(false); setActiveStep(1); }}>अभी नहीं</button></div>
            {consent !== null && <p className="consent-status" role="status">{consent ? 'सहमति दर्ज हुई। यह demo कोई डेटा सेव नहीं करता।' : 'आपने सहमति नहीं दी। आपका दस्तावेज़ आगे नहीं बढ़ेगा।'}</p>}
          </section>

          <section className="progress-section" aria-labelledby="progress-title">
            <div className="progress-heading"><div><SectionLabel>APPLICATION JOURNEY</SectionLabel><h2 id="progress-title">आपके आवेदन के कदम</h2></div><span className="step-count">कदम {activeStep} / 4</span></div>
            <ol className="progress-steps">
              {[
                { title: 'बोलकर बताएं', english: 'Voice input', icon: <Mic size={17} /> },
                { title: 'कागज़ जाँचें', english: 'Kagaaz inspection', icon: <FileCheck2 size={17} /> },
                { title: 'सहमति दें', english: 'Privacy consent', icon: <ShieldCheck size={17} /> },
                { title: 'आवेदन भेजें', english: 'Prototype submission', icon: <ArrowRight size={17} /> },
              ].map((step, index) => <li className={index + 1 < activeStep ? 'step-complete' : index + 1 === activeStep ? 'step-current' : ''} key={step.english}><span className="step-icon">{index + 1 < activeStep ? <Check size={16} /> : step.icon}</span><span className="step-label"><strong>{step.title}</strong><small>{step.english}</small></span>{index < 3 && <span className="step-connector" aria-hidden="true" />}</li>)}
            </ol>
            <div className="inspector-note"><CircleHelp size={17} /><p><strong>जमा करने से पहले जाँचें</strong> साफ़, पूरी और पढ़ने योग्य फोटो चुनें। दस्तावेज़ की वैधता की पुष्टि संबंधित सरकारी विभाग करता है।</p><span className="inspector-status"><span /> READY TO REVIEW</span></div>
            <div className="inspection-alert" role="note"><CircleHelp size={16} /><p><strong>दस्तावेज़ की जाँच:</strong> धुंधली फोटो या समाप्त तारीख़ दिखे तो नई कॉपी चुनें। इस demo में blur या expiry की automatic जाँच उपलब्ध नहीं है।</p></div>
          </section>
          <footer className="page-footer"><BrandMark /><span>Jan-Setu AI <b>•</b> जन-सेतु</span><span className="footer-note">जन सेवा, आपकी भाषा में</span><a href="#home">ऊपर जाएँ ↑</a></footer>
        </section>
      </div>
      {selfieOpen && <SelfieStudio onClose={() => setSelfieOpen(false)} />}
    </main>
  )
}

declare global {
  interface Window {
    SpeechRecognition?: new () => {
      lang: string
      interimResults: boolean
      start: () => void
      stop: () => void
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
      onerror: (() => void) | null
      onend: (() => void) | null
    }
    webkitSpeechRecognition?: Window['SpeechRecognition']
  }
}

