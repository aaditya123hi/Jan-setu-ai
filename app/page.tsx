"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Baby, Camera, Check, CreditCard, FileText, GraduationCap, HandCoins, HeartHandshake, HeartPulse, Landmark, Mic, RefreshCw, ShieldCheck, Trash2, Wheat, type LucideIcon } from "lucide-react";
import { assess, RESULT_UI, SCENARIOS, type EligibilityResult } from "@/lib/eligibility";

type Dialect = {
    label: string;
    text: string;
};

type DocConfig = {
    label: string;
    english: string;
    req: boolean;
    rows: [string, string][];
};

type Doc = {
    name: string;
    size: number;
    url: string | null;
    status: "analyzing" | "done" | "error";
    error?: string;
};

const DIALECTS: Record<"hindi" | "bundeli" | "malvi" | "bagheli" | "english", Dialect> = {
    hindi: { label: "हिंदी", text: "मुझे पीएम-किसान सम्मान निधि के लिए आवेदन करना है" },
    bundeli: { label: "बुंदेली", text: "मोय पीएम-किसान योजना के लिए आवेदन करनो है" },
    malvi: { label: "मालवी", text: "म्हारे पीएम-किसान योजना में आवेदन करनो हे" },
    bagheli: { label: "बघेली", text: "हमका पीएम-किसान योजना के लिए आवेदन करै का है" },
    english: { label: "English", text: "I want to apply for PM-Kisan" },
};

type SchemeDefinition = {
    id: string;
    hindiName: string;
    englishName: string;
    shortDesc: string;
    icon: LucideIcon;
    keywords: string[];
    active: boolean;
};

const SCHEMES = [
    { id: "ladli-behna", hindiName: "लाडली बहना योजना", englishName: "Ladli Behna Yojana", shortDesc: "महिलाओं को मासिक आर्थिक सहायता", icon: HeartHandshake, keywords: ["लाडली", "बहना", "ladli", "laadli", "behna", "behen"], active: true },
    { id: "ladli-laxmi", hindiName: "लाडली लक्ष्मी योजना", englishName: "Ladli Laxmi Yojana", shortDesc: "बेटियों की शिक्षा और भविष्य के लिए सहायता", icon: Baby, keywords: ["लक्ष्मी", "laxmi", "lakshmi"], active: true },
    { id: "kanya-vivah", hindiName: "मुख्यमंत्री कन्या विवाह / निकाह योजना", englishName: "Mukhyamantri Kanya Vivah Yojana", shortDesc: "विवाह के लिए आर्थिक सहायता", icon: HeartHandshake, keywords: ["कन्या विवाह", "निकाह", "vivah", "kanya"], active: true },
    { id: "sambal", hindiName: "संबल योजना", englishName: "Sambal Yojana", shortDesc: "असंगठित श्रमिकों को सामाजिक सुरक्षा", icon: ShieldCheck, keywords: ["संबल", "sambal"], active: true },
    { id: "pension", hindiName: "सामाजिक सुरक्षा पेंशन", englishName: "Social Security Pension", shortDesc: "बुज़ुर्ग, विधवा और दिव्यांगों के लिए पेंशन", icon: HeartPulse, keywords: ["पेंशन", "pension"], active: true },
    { id: "pm-awas", hindiName: "प्रधानमंत्री आवास योजना", englishName: "PM Awas Yojana", shortDesc: "पक्का घर बनाने में सहायता", icon: Landmark, keywords: ["आवास", "awas", "घर", "ghar"], active: true },
    { id: "ayushman", hindiName: "आयुष्मान भारत", englishName: "Ayushman Bharat", shortDesc: "स्वास्थ्य बीमा और इलाज में सहायता", icon: HeartPulse, keywords: ["आयुष्मान", "ayushman", "स्वास्थ्य"], active: true },
    { id: "kisan", hindiName: "किसान कल्याण / PM किसान सम्मान निधि", englishName: "Kisan Samman Nidhi", shortDesc: "किसानों को आर्थिक सहायता", icon: Wheat, keywords: ["किसान", "kisan", "खेती", "pm-kisan", "pm kisan"], active: true },
    { id: "certificate", hindiName: "प्रमाण पत्र सेवाएँ", englishName: "Certificates", shortDesc: "आय और अन्य प्रमाण पत्रों की तैयारी", icon: FileText, keywords: ["प्रमाण पत्र", "certificate", "income certificate"], active: true },
    { id: "ration", hindiName: "राशन कार्ड / खाद्य सुरक्षा", englishName: "Ration Card", shortDesc: "सस्ता राशन और खाद्य सुरक्षा", icon: CreditCard, keywords: ["राशन", "ration"], active: true },
    { id: "sikho-kamao", hindiName: "सीखो कमाओ योजना", englishName: "Sikho Kamao Yojana", shortDesc: "युवाओं को प्रशिक्षण के साथ मासिक सहायता", icon: GraduationCap, keywords: ["सीखो", "कमाओ", "sikho", "kamao", "युवा"], active: true },
] satisfies SchemeDefinition[];

type SchemeId = (typeof SCHEMES)[number]["id"];

const DOCS: Record<"aadhaar" | "samagra" | "income", DocConfig> = {
    aadhaar: {
        label: "आधार कार्ड",
        english: "Aadhaar Card",
        req: true,
        rows: [["नाम", "सुनीता देवी"], ["जन्म तिथि", "XX/XX/XXXX"], ["आधार", "XXXX-XXXX-8921"]],
    },
    samagra: {
        label: "समग्र आईडी",
        english: "Samagra ID",
        req: true,
        rows: [["समग्र ID", "XXXXXXX41"], ["परिवार सदस्य", "4"]],
    },
    income: {
        label: "आय प्रमाण पत्र",
        english: "Income Certificate",
        req: false,
        rows: [["वार्षिक आय", "₹1,80,000"], ["वैधता", "2026-27"]],
    },
};

const STEPS = ["आवाज़", "पात्रता", "दस्तावेज़", "फोटो", "समीक्षा"];
const btn = "w-full rounded-2xl bg-teal-700 px-5 py-4 text-lg font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
const ghost = "w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-300";
const card = "rounded-3xl border border-slate-200 bg-white";

type DocKey = keyof typeof DOCS;

type DocsStepProps = {
    docs: Record<string, Doc>;
    setDocs: React.Dispatch<React.SetStateAction<Record<string, Doc>>>;
    onNext: () => void;
};

function DocsStep({ docs, setDocs, onNext }: DocsStepProps) {
    const docsRef = useRef(docs);
    const timersRef = useRef<Partial<Record<DocKey, ReturnType<typeof setTimeout>>>>({});

    useEffect(() => {
        docsRef.current = docs;
    }, [docs]);

    const updateDocs = (update: (current: Record<string, Doc>) => Record<string, Doc>) => {
        const nextDocs = update(docsRef.current);
        docsRef.current = nextDocs;
        setDocs(nextDocs);
    };

    const pick = (key: DocKey, file: File) => {
        const previousDoc = docsRef.current[key];
        if (previousDoc?.url) URL.revokeObjectURL(previousDoc.url);

        const previousTimer = timersRef.current[key];
        if (previousTimer) clearTimeout(previousTimer);
        delete timersRef.current[key];

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            updateDocs((current) => ({
                ...current,
                [key]: { name: file.name, size: file.size, url: null, status: "error", error: "केवल JPG, PNG, WEBP या PDF फाइल चुनें" },
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            updateDocs((current) => ({
                ...current,
                [key]: { name: file.name, size: file.size, url: null, status: "error", error: "फाइल 5 MB से छोटी होनी चाहिए" },
            }));
            return;
        }

        const pendingDoc: Doc = {
            name: file.name,
            size: file.size,
            url: file.type === "application/pdf" ? null : URL.createObjectURL(file),
            status: "analyzing",
        };
        updateDocs((current) => ({ ...current, [key]: pendingDoc }));

        const timer = setTimeout(() => {
            setDocs((current) => current[key] === pendingDoc
                ? { ...current, [key]: { ...pendingDoc, status: "done" } }
                : current);
            if (timersRef.current[key] === timer) delete timersRef.current[key];
        }, 1500);
        timersRef.current[key] = timer;
    };

    const remove = (key: DocKey) => {
        const doc = docsRef.current[key];
        if (doc?.url) URL.revokeObjectURL(doc.url);

        const timer = timersRef.current[key];
        if (timer) clearTimeout(timer);
        delete timersRef.current[key];

        updateDocs((current) => {
            const nextDocs = { ...current };
            delete nextDocs[key];
            return nextDocs;
        });
    };

    const canContinue = Object.entries(DOCS).every(([key, config]) => !config.req || docs[key]?.status === "done");

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">अपने दस्तावेज़ स्कैन करें</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">फोटो या PDF चुनें (JPG, PNG, WEBP, PDF · अधिकतम 5 MB)।</p>
            </div>

            <div className="space-y-4">
                {(Object.keys(DOCS) as DocKey[]).map((key) => {
                    const config = DOCS[key];
                    const doc = docs[key];
                    const showInputs = !doc || doc.status === "error";

                    return (
                        <article key={key} className={`${card} space-y-4 p-4 sm:p-5`}>
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    {config.label} <span className="font-normal text-slate-500">({config.english})</span>
                                    {config.req && <span className="ml-1 text-sm text-slate-600">· ज़रूरी</span>}
                                </h3>
                            </div>

                            {showInputs ? (
                                <div className="space-y-3">
                                    {doc?.error && <p role="alert" className="text-sm font-medium text-red-700">{doc.error}</p>}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor={`f-${key}`} className={`${ghost} block cursor-pointer text-center`}>अपलोड करें</label>
                                            <input
                                                id={`f-${key}`}
                                                type="file"
                                                accept="image/*,application/pdf"
                                                className="sr-only"
                                                onChange={(event) => {
                                                    const file = event.currentTarget.files?.[0];
                                                    if (file) pick(key, file);
                                                    event.currentTarget.value = "";
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`c-${key}`} className={`${ghost} block cursor-pointer text-center`}>कैमरे से लें</label>
                                            <input
                                                id={`c-${key}`}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="sr-only"
                                                onChange={(event) => {
                                                    const file = event.currentTarget.files?.[0];
                                                    if (file) pick(key, file);
                                                    event.currentTarget.value = "";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3">
                                        {doc.url ? (
                                            <img src={doc.url} alt={`${config.label} का चुना हुआ दस्तावेज़`} className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover" />
                                        ) : (
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-teal-700">
                                                <FileText aria-hidden="true" className="h-8 w-8" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-slate-800" title={doc.name}>{doc.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button type="button" onClick={() => remove(key)} className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-red-700">
                                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                                            हटाएँ
                                        </button>
                                    </div>

                                    {doc.status === "analyzing" ? (
                                        <div className="flex items-center gap-2 text-sm font-medium text-teal-800" role="status">
                                            <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin" />
                                            जाँच रहे हैं…
                                        </div>
                                    ) : (
                                        <div className="space-y-3 rounded-2xl bg-teal-50 p-4">
                                            <p className="font-semibold text-teal-900">पहचाना गया</p>
                                            <p className="text-xs font-semibold text-teal-800">नमूना डेटा — Demo Extraction</p>
                                            {key === "aadhaar" && (
                                                <p className="flex items-center gap-2 text-sm text-slate-700">
                                                    <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-700" />
                                                    आधार नंबर मास्क किया गया
                                                </p>
                                            )}
                                            <dl className="space-y-2 text-sm">
                                                {config.rows.map(([label, value]) => (
                                                    <div key={label} className="flex justify-between gap-3 border-t border-teal-100 pt-2">
                                                        <dt className="text-slate-600">{label}</dt>
                                                        <dd className="text-right font-medium text-slate-900">{value}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            <p className="text-center text-xs text-slate-500">फाइलें इस डेमो में सिर्फ आपके ब्राउज़र में रहती हैं।</p>
            <button type="button" className={btn} disabled={!canContinue} onClick={onNext}>
                आगे बढ़ें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
            </button>
        </section>
    );
}

type SpeechRecognitionEventLike = {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceStepProps = {
    typingMode: boolean;
    selectedScheme: SchemeId | null;
    onSelectScheme: (schemeId: SchemeId | null) => void;
    onNext: (schemeId: SchemeId) => void;
};

function VoiceStep({ typingMode, selectedScheme, onSelectScheme, onNext }: VoiceStepProps) {
    const [transcript, setTranscript] = useState("");
    const [listening, setListening] = useState(false);
    const [voiceError, setVoiceError] = useState("");
    const [detecting, setDetecting] = useState(false);
    const [offline, setOffline] = useState(false);
    const [supported, setSupported] = useState(true);
    const [showChromeNote, setShowChromeNote] = useState(false);
    const [micTestMessage, setMicTestMessage] = useState("");
    const [dialect, setDialect] = useState<keyof typeof DIALECTS>("hindi");
    const [search, setSearch] = useState("");
    const [noMatch, setNoMatch] = useState(false);
    const [detectionRequested, setDetectionRequested] = useState(false);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const currentSpeechRef = useRef("");
    const speechErrorRef = useRef(false);

    const findScheme = useCallback((text: string) => {
        const normalizedText = text.toLocaleLowerCase("hi-IN");
        return SCHEMES.find((scheme) => scheme.keywords.some((keyword) => normalizedText.includes(keyword.toLocaleLowerCase("hi-IN")))) ?? null;
    }, []);

    useEffect(() => {
        const browserWindow = window as unknown as {
            SpeechRecognition?: SpeechRecognitionConstructor;
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
        };
        setSupported(Boolean(browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition));
        const userAgent = navigator.userAgent;
        const braveNavigator = navigator as Navigator & { brave?: unknown };
        setShowChromeNote(/Edg|Firefox/i.test(userAgent) || Boolean(braveNavigator.brave));

        return () => {
            const recognition = recognitionRef.current;
            if (recognition) {
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onend = null;
                recognition.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!detectionRequested) return;
        const text = transcript.trim();
        const localScheme = findScheme(text);
        onSelectScheme(localScheme?.id ?? null);
        setNoMatch(!localScheme);
        setOffline(false);
        if (!text) {
            setDetecting(false);
            return;
        }
        setDetecting(true);

        const controller = new AbortController();
        let active = true;
        const timeoutTimer = window.setTimeout(() => controller.abort(), 5000);
        const requestTimer = window.setTimeout(async () => {
            const safeText = text.slice(0, 300).replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[मास्क किया]");
            try {
                const response = await fetch("/api/detect-scheme", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: safeText }),
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Scheme detection unavailable");
                const payload: unknown = await response.json();
                if (typeof payload !== "object" || payload === null || !("schemeId" in payload)) {
                    throw new Error("Invalid scheme response");
                }
                const detected = payload.schemeId;
                if (typeof detected !== "string") {
                    throw new Error("Invalid scheme response");
                }
                const matchingScheme = SCHEMES.find((scheme) => scheme.id === detected);
                if (detected !== "unknown" && !matchingScheme) throw new Error("Invalid scheme response");
                if (matchingScheme) onSelectScheme(matchingScheme.id);
                setOffline(false);
            } catch {
                if (active) {
                    setOffline(true);
                }
            } finally {
                window.clearTimeout(timeoutTimer);
                if (active) setDetecting(false);
            }
        }, 300);

        return () => {
            active = false;
            window.clearTimeout(requestTimer);
            window.clearTimeout(timeoutTimer);
            controller.abort();
        };
    }, [detectionRequested, findScheme, onSelectScheme, transcript]);

    const startListening = () => {
        setVoiceError("");
        const browserWindow = window as unknown as {
            SpeechRecognition?: SpeechRecognitionConstructor;
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
        };
        const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
        if (!Recognition) {
            setSupported(false);
            setVoiceError("इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। नीचे लिखकर जारी रखें।");
            return;
        }

        const recognition = new Recognition();
        recognition.lang = dialect === "english" ? "en-IN" : "hi-IN";
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;
        currentSpeechRef.current = "";
        speechErrorRef.current = false;
        setTranscript("");
        setDetectionRequested(false);
        setNoMatch(false);
        onSelectScheme(null);
        recognition.onresult = (event) => {
            const recognizedText = Array.from(event.results)
                .map((result) => result[0]?.transcript ?? "")
                .join("")
                .trim();
            currentSpeechRef.current = recognizedText;
            if (recognizedText) setTranscript(recognizedText);
        };
        recognition.onerror = (event) => {
            speechErrorRef.current = true;
            setListening(false);
            const messages: Record<string, string> = {
                "not-allowed": "माइक की अनुमति दें (ब्राउज़र में 🔒 आइकन → Microphone → Allow)",
                "service-not-allowed": "माइक की अनुमति दें (ब्राउज़र में 🔒 आइकन → Microphone → Allow)",
                "no-speech": "कुछ सुनाई नहीं दिया, दोबारा बोलें",
                "audio-capture": "माइक नहीं मिला (Windows Settings → Privacy → Microphone जाँचें)",
                network: "इंटरनेट जाँचें, या Chrome में आज़माएँ",
            };
            const message = messages[event.error] ?? `माइक में समस्या [${event.error}]`;
            setVoiceError(`${message} (${event.error})`);
        };
        recognition.onend = () => {
            setListening(false);
            const finalTranscript = currentSpeechRef.current.trim();
            if (finalTranscript) {
                setTranscript(finalTranscript);
                setDetectionRequested(true);
            } else if (!speechErrorRef.current) {
                setVoiceError("आवाज़ नहीं पकड़ी गई (Edge/Brave में अक्सर ऐसा होता है)। Chrome में आज़माएँ या नीचे विकल्प चुनें");
            }
            if (recognitionRef.current === recognition) recognitionRef.current = null;
        };
        recognitionRef.current = recognition;

        try {
            recognition.start();
            setListening(true);
        } catch {
            setListening(false);
            setVoiceError("माइक में समस्या [start]");
        }
    };

    const toggleListening = () => {
        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
        } else {
            startListening();
        }
    };

    const checkMicrophone = async () => {
        setMicTestMessage("");
        if (!window.isSecureContext) {
            setMicTestMessage("माइक जाँचने के लिए https या localhost पर खोलें।");
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setMicTestMessage("इस ब्राउज़र में माइक जाँच उपलब्ध नहीं है।");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            setMicTestMessage("माइक ठीक है ✓");
        } catch (error) {
            const errorName = error instanceof Error ? error.name : "UnknownError";
            const messages: Record<string, string> = {
                NotAllowedError: "माइक की अनुमति दें (ब्राउज़र में 🔒 आइकन → Microphone → Allow)",
                NotFoundError: "माइक नहीं मिला (Windows Settings → Privacy → Microphone जाँचें)",
                NotReadableError: "माइक किसी दूसरे ऐप में चल रहा है",
            };
            setMicTestMessage(messages[errorName] ?? `माइक जाँच नहीं हो पाई [${errorName}]`);
        }
    };

    const handleTranscriptChange = (value: string) => {
        setTranscript(value.slice(0, 300));
        setDetectionRequested(false);
        setNoMatch(false);
        setVoiceError("");
        setOffline(false);
        onSelectScheme(null);
    };

    const submitTypedTranscript = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setVoiceError("");
        setDetectionRequested(true);
    };

    const useSampleTranscript = () => {
        const sample = DIALECTS[dialect].text;
        setTranscript(sample);
        setDetectionRequested(true);
        setNoMatch(false);
        setVoiceError("");
        onSelectScheme(null);
    };

    const filteredSchemes = SCHEMES.filter((scheme) => {
        const query = search.trim().toLocaleLowerCase("hi-IN");
        return !query || scheme.hindiName.toLocaleLowerCase("hi-IN").includes(query) || scheme.englishName.toLocaleLowerCase("en-IN").includes(query);
    });
    const selectedSchemeDetails = SCHEMES.find((scheme) => scheme.id === selectedScheme) ?? null;

    return (
        <section className={`${card} space-y-5 p-5 sm:p-8`}>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">आवाज़ से बताइए</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">हिंदी, स्थानीय बोली या English में बोलें अथवा लिखें।</p>
            </div>
            {showChromeNote && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">बेहतर वॉइस सपोर्ट के लिए Chrome इस्तेमाल करें</p>}
            {typingMode && <p className="text-sm text-slate-600">Type करें — आवाज़ की सुविधा भी नीचे उपलब्ध है।</p>}

            {!supported ? (
                <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">इस ब्राउज़र में वॉइस सपोर्ट नहीं है</p>
            ) : (
                <div className="space-y-3">
                    <button type="button" className={listening ? btn.replace("bg-teal-700", "bg-red-700") : btn} onClick={toggleListening} aria-pressed={listening}>
                        <span className="inline-flex items-center justify-center gap-2">
                            <Mic aria-hidden="true" className="h-5 w-5" />
                            {listening ? "सुनना बंद करें" : "बोलने के लिए दबाएँ"}
                        </span>
                    </button>
                </div>
            )}
            <div className="flex flex-wrap gap-2" role="group" aria-label="बोली चुनें">
                {(Object.keys(DIALECTS) as (keyof typeof DIALECTS)[]).map((key) => (
                    <button key={key} type="button" aria-pressed={dialect === key} onClick={() => setDialect(key)} className={`rounded-full border px-3 py-1.5 text-sm ${dialect === key ? "border-teal-700 bg-teal-50 font-semibold text-teal-900" : "border-slate-300 bg-white text-slate-700"}`}>
                        {DIALECTS[key].label}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500">माइक पहचान ब्राउज़र पर निर्भर है। स्थानीय बोलियों के लिए नमूना transcript भी इस्तेमाल कर सकते हैं।</p>
            {supported && (
                <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={checkMicrophone}>माइक जाँचें</button>
                    {micTestMessage && <span role="status" className="text-sm text-slate-700">{micTestMessage}</span>}
                </div>
            )}

            <form className="space-y-3" onSubmit={submitTypedTranscript}>
                <label htmlFor="voice-transcript" className="block text-sm font-medium text-slate-700">या Type करें</label>
                <textarea
                    id="voice-transcript"
                    value={transcript}
                    onChange={(event) => handleTranscriptChange(event.currentTarget.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="जैसे: मुझे PM-किसान योजना के लिए आवेदन करना है"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-base text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                />
                <button type="submit" className={ghost} disabled={!transcript.trim() || detecting}>भेजें</button>
            </form>

            <button type="button" className={ghost} onClick={useSampleTranscript}>▶ डेमो: नमूना आवाज़ इस्तेमाल करें (सिम्युलेटेड)</button>
            {voiceError && <p role="alert" className="text-sm text-amber-800">{voiceError}</p>}
            {detecting && <p role="status" className="text-sm text-slate-600">योजना पहचान रहे हैं…</p>}
            {offline && <p role="status" className="text-sm font-medium text-amber-800">ऑफ़लाइन डेमो मोड</p>}
            {noMatch && <p role="status" className="text-sm text-amber-800">योजना नहीं पहचानी गई. दोबारा बोलें या नीचे से चुनें</p>}
            {transcript.trim() && !detecting && selectedSchemeDetails && (
                <p className="text-sm text-slate-700">{selectedSchemeDetails.hindiName} चुनी गई।</p>
            )}

            <div className="space-y-4 border-t border-slate-200 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-slate-900">या यहाँ से योजना चुनें</h3>
                    <label className="sr-only" htmlFor="scheme-search">योजना खोजें</label>
                    <input
                        id="scheme-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="योजना खोजें"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 sm:max-w-xs"
                    />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredSchemes.map((scheme) => {
                        const Icon = scheme.icon;
                        const isSelected = selectedScheme === scheme.id;
                        return (
                            <button
                                key={scheme.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => {
                                    onSelectScheme(scheme.id);
                                    setNoMatch(false);
                                }}
                                className={`rounded-2xl border p-4 text-left transition ${isSelected ? "border-teal-700 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white hover:border-teal-500"}`}
                            >
                                <span className="flex items-start gap-3">
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                                        <Icon aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-start justify-between gap-2">
                                            <span className="font-semibold text-slate-900">{scheme.hindiName}</span>
                                            {isSelected && <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-teal-700" />}
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-600">{scheme.englishName}</span>
                                        <span className="mt-2 block text-sm text-slate-700">{scheme.shortDesc}</span>
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    {filteredSchemes.length === 0 && <p className="text-sm text-slate-600">कोई योजना नहीं मिली।</p>}
                </div>

                {selectedSchemeDetails?.active && (
                    <div className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900" role="status">
                        <div>
                            <h4 className="font-bold">{selectedSchemeDetails.hindiName} पहचानी गई</h4>
                            <p className="mt-1 text-sm">AI Scheme Detection — Demo</p>
                        </div>
                        <button type="button" className={btn} onClick={() => onNext(selectedSchemeDetails.id)}>
                            आगे बढ़ें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
                        </button>
                    </div>
                )}
                {selectedSchemeDetails && !selectedSchemeDetails.active && (
                    <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">
                        <p className="text-sm leading-relaxed">{selectedSchemeDetails.hindiName} — इस प्रोटोटाइप में पूरा आवेदन केवल लाडली बहना योजना के लिए उपलब्ध है। बाकी योजनाएँ जल्द आ रही हैं।</p>
                        <button type="button" className={ghost} onClick={() => { onSelectScheme("ladli-behna"); setNoMatch(false); }}>
                            लाडली बहना योजना से डेमो देखें
                        </button>
                    </div>
                )}
                <p className="text-xs leading-relaxed text-slate-500">योजनाओं की सूची डेमो के लिए है। सही जानकारी के लिए संबंधित विभाग देखें।</p>
            </div>
        </section>
    );
}

function cropPassport(src: CanvasImageSource, width: number, height: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = 350;
    canvas.height = 450;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");

    const targetRatio = 3.5 / 4.5;
    const sourceRatio = width / height;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = width;
    let sourceHeight = height;

    if (sourceRatio > targetRatio) {
        sourceWidth = height * targetRatio;
        sourceX = (width - sourceWidth) / 2;
    } else {
        sourceHeight = width / targetRatio;
        sourceY = (height - sourceHeight) / 2;
    }

    context.drawImage(src, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
}

type PhotoStepProps = {
    photo: string | null;
    setPhoto: (photo: string | null) => void;
    onNext: () => void;
};

function PhotoStep({ photo, setPhoto, onNext }: PhotoStepProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [message, setMessage] = useState("");
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        if (stream) video.play().catch(() => { });

        return () => {
            video.srcObject = null;
        };
    }, [stream]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, []);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
    };

    const start = async () => {
        setMessage("");
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            setMessage("कैमरा केवल https या localhost पर चलता है। कृपया फोटो अपलोड करें।");
            return;
        }

        try {
            const nextStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            if (!mountedRef.current) {
                nextStream.getTracks().forEach((track) => track.stop());
                return;
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = nextStream;
            setStream(nextStream);
        } catch (error) {
            if (!mountedRef.current) return;
            const errorName = error instanceof Error ? error.name : "";
            if (errorName === "NotAllowedError") {
                setMessage("कैमरा की अनुमति दें (🔒 आइकन → Camera → Allow)");
            } else if (errorName === "NotFoundError") {
                setMessage("कैमरा नहीं मिला, फोटो अपलोड करें");
            } else if (errorName === "NotReadableError") {
                setMessage("कैमरा किसी दूसरे ऐप में चल रहा है");
            } else {
                setMessage("कैमरा शुरू नहीं हो पाया, फोटो अपलोड करें");
            }
        }
    };

    const capture = () => {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) {
            setMessage("कैमरा तैयार हो रहा है, एक सेकंड रुकें");
            return;
        }

        try {
            setPhoto(cropPassport(video, video.videoWidth, video.videoHeight));
            setMessage("");
            stopCamera();
        } catch {
            setMessage("यह फोटो खुल नहीं पाई");
        }
    };

    const upload = (file: File | undefined) => {
        if (!file) return;
        stopCamera();
        setMessage("");

        if (!file.type.startsWith("image/")) {
            setMessage("कृपया इमेज फाइल चुनें");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage("फोटो 5 MB से छोटी होनी चाहिए");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            try {
                setPhoto(cropPassport(image, image.naturalWidth, image.naturalHeight));
            } catch {
                setMessage("यह फोटो खुल नहीं पाई");
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setMessage("यह फोटो खुल नहीं पाई");
        };
        image.src = objectUrl;
    };

    const continueNext = () => {
        stopCamera();
        onNext();
    };

    const retake = () => {
        setPhoto(null);
        setMessage("");
    };

    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">अपनी फोटो लें</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">पासपोर्ट साइज़ 3.5 × 4.5 सेमी</p>
            </div>

            <div className={`${card} flex flex-col items-center gap-4 p-5 sm:p-7`}>
                <div className="relative flex h-[225px] w-[175px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={stream && !photo ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
                    />
                    {photo ? (
                        <img src={photo} alt="पासपोर्ट साइज़ फोटो का पूर्वावलोकन" className="absolute inset-0 h-full w-full object-cover" />
                    ) : !stream ? (
                        <Camera aria-hidden="true" className="h-10 w-10 text-slate-400" />
                    ) : null}
                </div>

                <p className="text-center text-sm font-medium text-slate-700">Passport Photo Formatting — Prototype (क्रॉप/रीसाइज़ केवल)</p>

                {message && <p role="alert" className="text-center text-sm font-medium text-red-700">{message}</p>}

                {photo ? (
                    <button type="button" className={ghost} onClick={retake}>दोबारा लें</button>
                ) : (
                    <div className="w-full space-y-3">
                        {stream ? (
                            <button type="button" className={btn} onClick={capture}>फोटो लें</button>
                        ) : (
                            <button type="button" className={ghost} onClick={start}>कैमरा शुरू करें</button>
                        )}
                        <label htmlFor="passport-photo-upload" className={`${btn} block cursor-pointer text-center`}>
                            फोटो अपलोड करें
                        </label>
                        <input
                            id="passport-photo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => {
                                upload(event.currentTarget.files?.[0]);
                                event.currentTarget.value = "";
                            }}
                        />
                    </div>
                )}
            </div>

            <button type="button" className={btn} disabled={!photo} onClick={continueNext}>
                आगे बढ़ें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
            </button>
        </section>
    );
}

export default function Page() {
    const [step, setStep] = useState(0);
    const [entryView, setEntryView] = useState<"home" | "auth" | "dashboard">("home");
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [mobile, setMobile] = useState("1234567890");
    const [password, setPassword] = useState("password");
    const [applicantName, setApplicantName] = useState("");
    const [authError, setAuthError] = useState("");
    const [eligibilityForm, setEligibilityForm] = useState({ age: "34", gender: "महिला", income: "180000", land: "1.5" });
    const [typing0, setTyping0] = useState(false);
    const [docs, setDocs] = useState<Record<string, Doc>>({});
    const [scen, setScen] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [ref, setRef] = useState<string | null>(null);
    const [selectedScheme, setSelectedScheme] = useState<SchemeId | null>(null);
    const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult>("ok");
    const [eligibilityLoading, setEligibilityLoading] = useState(false);
    const [eligibilityOffline, setEligibilityOffline] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [offlineSubmission, setOfflineSubmission] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const docUrlsRef = useRef<Record<string, Doc>>({});

    const selectedScenario = SCENARIOS.find((scenario) => scenario.k === scen) ?? {
        k: "more" as const,
        label: "आपकी जानकारी",
        age: Number(eligibilityForm.age) || 0,
        gender: eligibilityForm.gender,
        income: eligibilityForm.income.trim() === "" ? null : Number(eligibilityForm.income),
        land: eligibilityForm.land.trim() === "" ? null : `${eligibilityForm.land} एकड़`,
    };
    const handleSchemeSelect = useCallback((schemeId: SchemeId | null) => setSelectedScheme(schemeId), []);

    useEffect(() => {
        if (step !== 2 || !selectedScenario) return;

        const eligibilityInput = {
            age: selectedScenario.age,
            gender: selectedScenario.gender,
            income: selectedScenario.income,
            land: selectedScenario.land,
        };
        const localResult = selectedScheme === "ladli-behna" ? assess(eligibilityInput) : "more";
        const controller = new AbortController();
        let active = true;
        const timeoutTimer = window.setTimeout(() => controller.abort(), 5000);
        setEligibilityResult(localResult);
        setEligibilityOffline(false);
        setEligibilityLoading(true);

        const checkEligibility = async () => {
            try {
                const response = await fetch("/api/eligibility", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...eligibilityInput, schemeId: selectedScheme }),
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Eligibility service unavailable");
                const payload: unknown = await response.json();
                if (typeof payload !== "object" || payload === null || !("result" in payload)) {
                    throw new Error("Invalid eligibility response");
                }
                const result = payload.result;
                if (result !== "ok" && result !== "no" && result !== "more") {
                    throw new Error("Invalid eligibility response");
                }
                setEligibilityResult(result);
            } catch {
                if (active) {
                    setEligibilityResult(localResult);
                    setEligibilityOffline(true);
                }
            } finally {
                window.clearTimeout(timeoutTimer);
                if (active) setEligibilityLoading(false);
            }
        };

        void checkEligibility();
        return () => {
            active = false;
            window.clearTimeout(timeoutTimer);
            controller.abort();
        };
    }, [scen, eligibilityForm.age, eligibilityForm.gender, eligibilityForm.income, eligibilityForm.land, selectedScheme, step]);

    const replaceDocs = (nextDocs: Record<string, Doc>) => {
        docUrlsRef.current = nextDocs;
        setDocs(nextDocs);
    };

    const revokeDocUrls = () => {
        Object.values(docUrlsRef.current).forEach((doc) => {
            if (doc.url) URL.revokeObjectURL(doc.url);
        });
        docUrlsRef.current = {};
    };

    useEffect(() => {
        docUrlsRef.current = docs;
    }, [docs]);

    useEffect(() => {
        return () => {
            Object.values(docUrlsRef.current).forEach((doc) => {
                if (doc.url) URL.revokeObjectURL(doc.url);
            });
            docUrlsRef.current = {};
        };
    }, []);

    const reset = () => {
        revokeDocUrls();
        setStep(0);
        setEntryView("home");
        setTyping0(false);
        replaceDocs({});
        setScen(null);
        setPhoto(null);
        setConsent(false);
        setRef(null);
        setSelectedScheme(null);
        setEligibilityResult("ok");
        setEligibilityOffline(false);
        setSubmitLoading(false);
        setSubmitError("");
        setOfflineSubmission(false);
        setSubmissionStatus("");
        setStatusLoading(false);
        setStatusMessage("");
    };

    const continueToDashboard = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthError("");
        if (!/^\d{10}$/.test(mobile)) {
            setAuthError("कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।");
            return;
        }
        if (password.length < 4) {
            setAuthError("पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।");
            return;
        }
        if (authMode === "signup" && !applicantName.trim()) {
            setAuthError("कृपया अपना नाम दर्ज करें।");
            return;
        }
        setEntryView("dashboard");
    };

    const openApplication = (typing: boolean, schemeId?: SchemeId) => {
        setTyping0(typing);
        if (schemeId) setSelectedScheme(schemeId);
        setStep(1);
    };

    const submitPrototype = async () => {
        if (!consent || submitLoading) return;
        setSubmitLoading(true);
        setSubmitError("");
        const controller = new AbortController();
        const timeoutTimer = window.setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schemeId: selectedScheme ?? SCHEMES[0].id,
                    applicantName: "नमूना आवेदनकर्ता",
                    maskedAadhaar: "XXXX-XXXX-8921",
                    eligibilityResult,
                    consent: true,
                }),
                signal: controller.signal,
            });
            if (!response.ok) throw new Error("सबमिशन सेवा अभी उपलब्ध नहीं है।");
            const payload: unknown = await response.json();
            if (
                typeof payload !== "object" || payload === null ||
                !("refId" in payload) || typeof payload.refId !== "string" ||
                !("status" in payload) || typeof payload.status !== "string"
            ) {
                throw new Error("सबमिशन का जवाब सही नहीं है।");
            }

            setRef(payload.refId);
            setSubmissionStatus(payload.status);
            setOfflineSubmission(false);
            setStatusMessage("");
            setStep(6);
        } catch (error) {
            setSubmitError(error instanceof Error && error.name !== "AbortError"
                ? error.message
                : "सबमिशन सेवा समय पर जवाब नहीं दे पाई।");
        } finally {
            window.clearTimeout(timeoutTimer);
            setSubmitLoading(false);
        }
    };

    const continueOfflineDemo = () => {
        setRef(`JS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setSubmissionStatus("OFFLINE_DEMO");
        setOfflineSubmission(true);
        setStatusMessage("");
        setStep(6);
    };

    const checkSubmissionStatus = async () => {
        if (!ref) return;
        setStatusLoading(true);
        setStatusMessage("");
        const controller = new AbortController();
        const timeoutTimer = window.setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(`/api/status/${encodeURIComponent(ref)}`, { signal: controller.signal });
            if (!response.ok) throw new Error("स्थिति अभी उपलब्ध नहीं है।");
            const payload: unknown = await response.json();
            if (
                typeof payload !== "object" || payload === null ||
                !("status" in payload) || typeof payload.status !== "string" ||
                !("createdAt" in payload) || typeof payload.createdAt !== "string"
            ) {
                throw new Error("स्थिति का जवाब सही नहीं है।");
            }
            setStatusMessage(`${payload.status} · ${new Date(payload.createdAt).toLocaleString("hi-IN")}`);
        } catch {
            setStatusMessage(offlineSubmission
                ? "ऑफ़लाइन डेमो मोड · इस रेफरेंस की सर्वर स्थिति उपलब्ध नहीं है।"
                : "ऑफ़लाइन डेमो मोड · स्थिति अभी सर्वर से नहीं मिल सकी।");
        } finally {
            window.clearTimeout(timeoutTimer);
            setStatusLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white">
                            <Landmark aria-hidden="true" className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold leading-tight sm:text-lg">Jan-Setu AI <span className="text-teal-700">जन-सेतु</span></h1>
                            <p className="mt-1 text-xs text-slate-600 sm:text-sm">सरकारी सेवाएँ, आपकी भाषा में</p>
                        </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Prototype Demo</span>
                </div>
            </header>

            <main
                className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8"
                data-document-count={Object.keys(docs).length}
                data-scenario={scen ?? ""}
                data-photo={photo ?? ""}
                data-consent={consent ? "given" : "pending"}
                data-reference={ref ?? ""}
                data-dialect-options={Object.keys(DIALECTS).join(",")}
                data-document-options={Object.keys(DOCS).join(",")}
            >
                {step >= 1 && step <= 5 && (
                    <section aria-label="आवेदन की प्रगति" className="space-y-3">
                        <div className="flex items-start justify-between gap-1">
                            {STEPS.map((label, index) => {
                                const stepNumber = index + 1;
                                const done = stepNumber < step;
                                const current = stepNumber === step;
                                return (
                                    <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-teal-700 text-white" : current ? "bg-teal-700 text-white ring-4 ring-teal-100" : "bg-slate-200 text-slate-600"}`}>
                                            {done ? <Check aria-hidden="true" className="h-4 w-4" /> : stepNumber}
                                        </span>
                                        <span className={`text-[11px] leading-tight sm:text-xs ${current ? "font-semibold text-teal-800" : "text-slate-600"}`}>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }} />
                        </div>
                    </section>
                )}

                {step >= 1 && step <= 5 && (
                    <button className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-slate-600 hover:text-teal-800" onClick={() => setStep((current) => Math.max(0, current - 1))}>
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        पीछे
                    </button>
                )}

                {step === 0 && entryView === "home" && (
                    <div className="space-y-8">
                        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white">
                            <div className="grid gap-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 sm:p-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                                <div>
                                    <p className="text-sm font-bold text-teal-800">मध्य प्रदेश नागरिक सेवा</p>
                                    <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">सरकारी सेवाएँ, आपकी भाषा में</h2>
                                    <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-700">अपनी ज़रूरत बताइए। सही सेवा खोजने और आवेदन की तैयारी में हम कदम-दर-कदम मदद करेंगे।</p>
                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <button className={btn} onClick={() => { setTyping0(false); setEntryView("auth"); }}> <Mic aria-hidden="true" className="mr-2 inline h-5 w-5" /> आवाज़ से शुरू करें</button>
                                        <button className={ghost} onClick={() => { setTyping0(true); setEntryView("auth"); }}>लिखकर शुरू करें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" /></button>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-emerald-100 bg-white p-5">
                                    <p className="font-bold text-slate-900">कैसे काम करता है</p>
                                    <ol className="mt-4 space-y-4">
                                        {["अपनी सेवा चुनें", "जानकारी और दस्तावेज़ दें", "जाँचकर डेमो आवेदन जमा करें"].map((item, index) => <li key={item} className="flex items-center gap-3 text-sm text-slate-700"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">{index + 1}</span>{item}</li>)}
                                    </ol>
                                    <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">यह प्रोटोटाइप है। इससे कोई वास्तविक सरकारी आवेदन जमा नहीं होता।</p>
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="mb-4 flex items-end justify-between gap-2"><div><p className="text-xs font-bold text-teal-800">लोकप्रिय सेवाएँ</p><h3 className="mt-1 text-xl font-bold text-slate-900">किस सेवा में मदद चाहिए?</h3></div><span className="text-xs text-slate-500">एक चुनें</span></div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {[
                                    { label: "किसान", detail: "PM-किसान", icon: Wheat, scheme: "kisan" as SchemeId },
                                    { label: "महिला", detail: "लाड़ली बहना", icon: HeartHandshake, scheme: "ladli-behna" as SchemeId },
                                    { label: "विद्यार्थी", detail: "शिक्षा सहायता", icon: GraduationCap, scheme: "sikho-kamao" as SchemeId },
                                    { label: "आवास", detail: "घर के लिए सहायता", icon: Landmark, scheme: "pm-awas" as SchemeId },
                                    { label: "प्रमाण पत्र", detail: "दस्तावेज़ सेवाएँ", icon: FileText, scheme: "certificate" as SchemeId },
                                ].map(({ label, detail, icon: Icon, scheme }) => <button key={label} className={`${card} min-h-28 p-4 text-left transition hover:border-teal-500`} onClick={() => { setSelectedScheme(scheme); setTyping0(false); setEntryView("auth"); }}><Icon aria-hidden="true" className="h-6 w-6 text-teal-800" /><span className="mt-3 block font-bold text-slate-900">{label}</span><span className="mt-1 block text-sm text-slate-600">{detail}</span></button>)}
                            </div>
                        </section>
                    </div>
                )}

                {step === 0 && entryView === "auth" && (
                    <section className={`${card} mx-auto max-w-lg space-y-5 p-5 sm:p-8`}>
                        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-800" onClick={() => setEntryView("home")}><ArrowLeft aria-hidden="true" className="h-4 w-4" /> होम पर जाएँ</button>
                        <div><p className="text-sm font-bold text-teal-800">जन-सेतु में आपका स्वागत है</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{authMode === "login" ? "लॉग इन करें" : "नया खाता बनाएँ"}</h2><p className="mt-2 text-sm text-slate-600">यह केवल डेमो लॉगिन है; जानकारी सर्वर पर सेव नहीं होती।</p></div>
                        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="लॉग इन या साइन अप चुनें"><button type="button" className={`rounded-lg px-3 py-3 text-sm font-semibold ${authMode === "login" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"}`} aria-pressed={authMode === "login"} onClick={() => { setAuthMode("login"); setAuthError(""); }}>लॉग इन</button><button type="button" className={`rounded-lg px-3 py-3 text-sm font-semibold ${authMode === "signup" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"}`} aria-pressed={authMode === "signup"} onClick={() => { setAuthMode("signup"); setAuthError(""); }}>साइन अप</button></div>
                        <form className="space-y-4" onSubmit={continueToDashboard}>
                            {authMode === "signup" && <label className="block text-sm font-semibold text-slate-700">पूरा नाम<input required value={applicantName} onChange={(event) => setApplicantName(event.currentTarget.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="अपना नाम लिखें" /></label>}
                            <label className="block text-sm font-semibold text-slate-700">मोबाइल नंबर<input required inputMode="numeric" maxLength={10} value={mobile} onChange={(event) => setMobile(event.currentTarget.value.replace(/\D/g, "").slice(0, 10))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="10 अंकों का नंबर" /></label>
                            <label className="block text-sm font-semibold text-slate-700">पासवर्ड<input required type="password" minLength={4} value={password} onChange={(event) => setPassword(event.currentTarget.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="पासवर्ड दर्ज करें" /></label>
                            {authError && <p role="alert" className="text-sm font-medium text-red-700">{authError}</p>}
                            <button className={btn} type="submit">{authMode === "login" ? "डैशबोर्ड खोलें" : "खाता बनाएँ"} <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" /></button>
                        </form>
                    </section>
                )}

                {step === 0 && entryView === "dashboard" && (
                    <section className="space-y-6">
                        <div><p className="text-sm font-bold text-teal-800">आपका सेवा डैशबोर्ड</p><h2 className="mt-2 text-2xl font-bold text-slate-900">नमस्ते{applicantName ? `, ${applicantName}` : ""}</h2><p className="mt-2 text-sm text-slate-600">आज आप किस सेवा के लिए आगे बढ़ना चाहेंगे?</p></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                { title: "वॉइस सहायक", text: "बोलकर या लिखकर सेवा खोजें", icon: Mic, action: () => openApplication(false) },
                                { title: "सेवाएँ", text: "लोकप्रिय सरकारी सेवाएँ", icon: Landmark, action: () => openApplication(false) },
                                { title: "पात्रता जाँच", text: "पहले सेवा चुनें, फिर पात्रता जाँचें", icon: Check, action: () => openApplication(typing0) },
                                { title: "दस्तावेज़ स्कैनर", text: "आधार, समग्र या आय प्रमाण पत्र", icon: FileText, action: () => { setSelectedScheme("ladli-behna"); setStep(3); } },
                                { title: "फोटो स्टूडियो", text: "पासपोर्ट साइज़ फोटो तैयार करें", icon: Camera, action: () => { setSelectedScheme("ladli-behna"); setStep(4); } },
                                { title: "मेरे आवेदन", text: ref ? `संदर्भ संख्या ${ref}` : "अभी कोई डेमो आवेदन नहीं", icon: HandCoins, action: () => setStep(ref ? 6 : 1) },
                            ].map(({ title, text, icon: Icon, action }) => <button key={title} type="button" className={`${card} flex min-h-28 items-start gap-4 p-5 text-left transition hover:border-teal-500`} onClick={action}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-teal-800"><Icon aria-hidden="true" className="h-6 w-6" /></span><span><span className="block font-bold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-relaxed text-slate-600">{text}</span></span><ArrowRight aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-teal-800" /></button>)}
                        </div>
                        <button type="button" className="text-sm font-semibold text-slate-600 underline underline-offset-4" onClick={() => setEntryView("home")}>लॉग आउट</button>
                    </section>
                )}

                {step === 1 ? (
                    <VoiceStep
                        typingMode={typing0}
                        selectedScheme={selectedScheme}
                        onSelectScheme={handleSchemeSelect}
                        onNext={(detectedScheme) => { setSelectedScheme(detectedScheme); setScen(null); setStep(2); }}
                    />
                ) : step === 2 ? (
                    <section className="space-y-5">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">पात्रता जाँच</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">चुनी गई सेवा के लिए अपनी मूल जानकारी भरें।</p>
                        </div>

                        <div className={`${card} grid gap-4 p-4 sm:grid-cols-2 sm:p-5`}>
                            <label className="block text-sm font-semibold text-slate-700">आयु (वर्ष)<input type="number" min="0" max="120" value={eligibilityForm.age} onChange={(event) => { setScen(null); setEligibilityForm((current) => ({ ...current, age: event.currentTarget.value })); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" /></label>
                            <label className="block text-sm font-semibold text-slate-700">लिंग<select value={eligibilityForm.gender} onChange={(event) => { setScen(null); setEligibilityForm((current) => ({ ...current, gender: event.currentTarget.value })); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"><option>महिला</option><option>पुरुष</option><option>अन्य</option></select></label>
                            <label className="block text-sm font-semibold text-slate-700">वार्षिक आय (₹)<input type="number" min="0" value={eligibilityForm.income} onChange={(event) => { setScen(null); setEligibilityForm((current) => ({ ...current, income: event.currentTarget.value })); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="खाली छोड़ें, यदि पता न हो" /></label>
                            <label className="block text-sm font-semibold text-slate-700">भूमि स्वामित्व (एकड़)<input type="number" min="0" step="0.1" value={eligibilityForm.land} onChange={(event) => { setScen(null); setEligibilityForm((current) => ({ ...current, land: event.currentTarget.value })); }} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="खाली छोड़ें, यदि पता न हो" /></label>
                            <p className="text-sm text-slate-600 sm:col-span-2">ज़रूरी दस्तावेज़: आधार कार्ड और समग्र आईडी। ये इस प्रोटोटाइप के नमूना चरण हैं।</p>
                        </div>

                        <div className="flex flex-wrap gap-2" role="group" aria-label="डेमो उदाहरण चुनें">
                            {SCENARIOS.map((scenario) => {
                                const isSelected = scen === scenario.k;
                                return (
                                    <button
                                        key={scenario.k}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => { setScen(scenario.k); setEligibilityForm({ age: String(scenario.age), gender: scenario.gender, income: scenario.income === null ? "" : String(scenario.income), land: scenario.land === null ? "" : scenario.land.replace(/[^\d.]/g, "") }); }}
                                        className={`min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${isSelected ? "border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-100" : "border-slate-300 bg-white text-slate-700 hover:border-teal-500"}`}
                                    >
                                        {scenario.label}
                                    </button>
                                );
                            })}
                        </div>

                        {eligibilityLoading && <p role="status" className="text-sm text-slate-600">डेमो पात्रता जाँच रहे हैं…</p>}
                        {eligibilityOffline && <p role="status" className="text-sm font-medium text-amber-800">ऑफ़लाइन डेमो मोड</p>}

                        {(() => {
                            const result = eligibilityResult;
                            const income = selectedScenario.income === null
                                ? "उपलब्ध नहीं"
                                : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedScenario.income);

                            return (
                                <>
                                    <div className={`${card} overflow-hidden`}>
                                        <table className="w-full table-fixed text-left text-sm">
                                            <tbody className="divide-y divide-slate-100">
                                                <tr>
                                                    <th scope="row" className="w-2/5 px-4 py-3 font-medium text-slate-600">आयु</th>
                                                    <td className="break-words px-4 py-3 font-semibold text-slate-900">{selectedScenario.age} वर्ष</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="px-4 py-3 font-medium text-slate-600">लिंग</th>
                                                    <td className="break-words px-4 py-3 font-semibold text-slate-900">{selectedScenario.gender}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="px-4 py-3 font-medium text-slate-600">वार्षिक आय</th>
                                                    <td className="break-words px-4 py-3 font-semibold text-slate-900">{income}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="px-4 py-3 font-medium text-slate-600">भूमि स्वामित्व</th>
                                                    <td className="break-words px-4 py-3 font-semibold text-slate-900">{selectedScenario.land ?? "उपलब्ध नहीं"}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="px-4 py-3 font-medium text-slate-600">ज़रूरी दस्तावेज़</th>
                                                    <td className="break-words px-4 py-3 font-semibold text-slate-900">आधार, समग्र ✓</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className={`rounded-3xl border p-5 sm:p-6 ${RESULT_UI[result].cls}`} role="status" aria-live="polite">
                                        <h3 className="text-lg font-bold">{RESULT_UI[result].title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed">{RESULT_UI[result].sub}</p>
                                    </div>
                                </>
                            );
                        })()}

                        <p className="text-sm leading-relaxed text-slate-600">Prototype Eligibility Assessment — Final eligibility is determined by the relevant authority.</p>
                        <button type="button" className={btn} disabled={eligibilityLoading || eligibilityResult === "no"} onClick={() => setStep(3)}>
                            आगे बढ़ें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
                        </button>
                    </section>
                ) : step === 3 ? (
                    <DocsStep docs={docs} setDocs={setDocs} onNext={() => setStep(4)} />
                ) : step === 4 ? (
                    <PhotoStep photo={photo} setPhoto={setPhoto} onNext={() => setStep(5)} />
                ) : step === 5 ? (
                    <section className="space-y-5">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">अंतिम समीक्षा</h2>
                        </div>

                        <div className={`${card} flex items-center gap-4 p-5`}>
                            {photo ? (
                                <img src={photo} alt="आवेदक की फोटो" className="h-[90px] w-[70px] shrink-0 rounded-xl border border-slate-200 object-cover" />
                            ) : (
                                <div className="flex h-[90px] w-[70px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                                    <Camera aria-hidden="true" className="h-7 w-7 text-slate-400" />
                                </div>
                            )}
                            <div className="min-w-0 space-y-1 text-sm">
                                <p className="truncate text-lg font-semibold text-slate-900">{applicantName || "सुनीता देवी (नमूना)"}</p>
                                <p className="text-slate-600">आधार: XXXX-XXXX-8921</p>
                                <p className="text-slate-600">योजना: {SCHEMES.find((scheme) => scheme.id === selectedScheme)?.hindiName ?? SCHEMES[0].hindiName}</p>
                            </div>
                        </div>

                        <ul className={`${card} space-y-3 p-5 text-sm`}>
                            {Object.entries(DOCS).filter(([key]) => docs[key]?.status === "done").map(([key, config]) => (
                                <li key={key} className="flex items-center gap-3">
                                    <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
                                    <span>{config.label}</span>
                                </li>
                            ))}
                            <li className="flex items-center gap-3">
                                <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
                                <span>फोटोग्राफ</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
                                <span>
                                    पात्रता: {(() => {
                                        return RESULT_UI[eligibilityResult].title.split(" (")[0];
                                    })()}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
                                <span>PII मास्क किया गया</span>
                            </li>
                        </ul>

                        <label htmlFor="prototype-consent" className={`${card} flex cursor-pointer items-start gap-4 p-5`}>
                            <input
                                id="prototype-consent"
                                type="checkbox"
                                checked={consent}
                                onChange={(event) => setConsent(event.currentTarget.checked)}
                                className="mt-1 h-6 w-6 shrink-0 accent-teal-700"
                            />
                            <span>
                                <span className="block font-medium leading-relaxed text-slate-900">मैं इस प्रोटोटाइप सबमिशन के लिए अपनी जानकारी के उपयोग की सहमति देता/देती हूँ।</span>
                                <span className="mt-1 block text-sm leading-relaxed text-slate-600">I consent to use my information for this prototype submission.</span>
                            </span>
                        </label>

                        {submitError && <p role="alert" className="text-sm font-medium text-red-700">{submitError}</p>}
                        <button type="button" className={btn} disabled={!consent || submitLoading} onClick={submitPrototype}>
                            {submitLoading ? "सबमिट हो रहा है…" : "Submit Prototype Application"}
                        </button>
                        {submitError && (
                            <button type="button" className={ghost} onClick={continueOfflineDemo}>
                                डेमो मोड में जारी रखें
                            </button>
                        )}
                    </section>
                ) : step >= 1 && step <= 5 && (
                    <section className={`${card} p-5 sm:p-8`}>
                        <p className="text-sm font-semibold text-teal-800">चरण {step} / {STEPS.length}</p>
                        <h2 className="mt-2 text-2xl font-bold">{STEPS[step - 1]}</h2>
                        <p className="mt-3 text-base leading-relaxed text-slate-600">
                            {step === 1
                                ? typing0
                                    ? "लिखकर बताने की सुविधा Prototype Demo के अगले चरण में आएगी।"
                                    : "आवाज़ की सुविधा Prototype Demo के अगले चरण में आएगी।"
                                : "यह सुविधा Prototype Demo के अगले चरण में आएगी।"}
                        </p>
                        <button className={`${btn} mt-6`} onClick={() => setStep((current) => Math.min(6, current + 1))}>
                            आगे बढ़ें <ArrowRight aria-hidden="true" className="ml-2 inline h-5 w-5" />
                        </button>
                    </section>
                )}

                {step === 6 && (
                    <section className={`${card} p-6 text-center sm:p-8`}>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                            <Check aria-hidden="true" className="h-7 w-7" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-slate-900">✅ Prototype Application Submitted</h2>
                        {offlineSubmission && <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">ऑफ़लाइन डेमो मोड</p>}
                        <div className={`${card} mx-auto mt-5 max-w-sm p-4`}>
                            <p className="text-sm text-slate-600">Reference ID</p>
                            <p className="mt-1 break-all font-mono text-xl font-bold text-teal-800">{ref}</p>
                            {submissionStatus && <p className="mt-2 text-xs font-medium text-slate-600">{submissionStatus}</p>}
                        </div>
                        <p className="mt-5 text-sm leading-relaxed text-slate-600">
                            यह एक प्रोटोटाइप/डेमो सबमिशन है। कोई वास्तविक सरकारी आवेदन जमा नहीं किया गया है।
                            <br />
                            This is a prototype/demo submission. No real government application was submitted.
                        </p>
                        <button type="button" className={`${ghost} mt-5`} disabled={statusLoading} onClick={checkSubmissionStatus}>
                            {statusLoading ? "स्थिति जाँच रहे हैं…" : "स्थिति देखें"}
                        </button>
                        {statusMessage && <p role="status" className="mt-2 text-sm text-slate-600">{statusMessage}</p>}
                        <button className={`${btn} mt-6`} onClick={reset}>Start New Application</button>
                    </section>
                )}
            </main>

            <footer className="mx-auto max-w-3xl space-y-3 px-4 pb-8 pt-2 text-sm text-slate-600 sm:px-6">
                <p className="text-center text-xs leading-relaxed">Jan-Setu AI · Team NovaMind · MPOnline Hackathon 2026 · Prototype Demo</p>
                <details className={`${card} px-4 py-3`}>
                    <summary className="cursor-pointer font-semibold text-slate-700">Technology / Prototype</summary>
                    <div className="mt-3 space-y-1.5 text-sm leading-relaxed">
                        <p>Voice uses the browser Web Speech API (Prototype / Demo).</p>
                        <p>Scanning and eligibility are simulated.</p>
                        <p>No government API connected.</p>
                        <p>Designed for Faster Kiosk Processing.</p>
                    </div>
                </details>
            </footer>
        </div>
    );
}
