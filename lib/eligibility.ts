export type EligibilityResult = "ok" | "no" | "more";

export type EligibilityInput = {
    age: number;
    gender: string;
    income: number | null;
    land: string | null;
};

export type EligibilityScenario = EligibilityInput & {
    k: EligibilityResult;
    label: string;
};

export const SCENARIOS: EligibilityScenario[] = [
    { k: "ok", label: "पात्र उदाहरण", age: 34, gender: "महिला", income: 180000, land: "1.5 एकड़" },
    { k: "no", label: "अपात्र उदाहरण", age: 19, gender: "महिला", income: 400000, land: "0 एकड़" },
    { k: "more", label: "जानकारी अधूरी", age: 34, gender: "महिला", income: null, land: null },
];

export const RESULT_UI: Record<EligibilityResult, { title: string; sub: string; cls: string }> = {
    ok: {
        title: "संभावित रूप से पात्र (Likely Eligible)",
        sub: "मूल जानकारी उपलब्ध है और बुनियादी मानदंड मेल खाते हैं।",
        cls: "border-emerald-300 bg-emerald-50 text-emerald-900",
    },
    no: {
        title: "पात्र नहीं (Not Eligible)",
        sub: "डेमो मानदंडों के अनुसार कुछ शर्तें पूरी नहीं होतीं।",
        cls: "border-red-300 bg-red-50 text-red-900",
    },
    more: {
        title: "और जानकारी चाहिए (More Information Needed)",
        sub: "कुछ जानकारी अधूरी है या इस सेवा के लिए डेमो पात्रता मानदंड उपलब्ध नहीं हैं।",
        cls: "border-amber-300 bg-amber-50 text-amber-900",
    },
};

export function assess(input: EligibilityInput): EligibilityResult {
    if (input.income === null || input.land === null) return "more";
    if (input.gender !== "महिला" || input.age < 21 || input.age > 60 || input.income > 250000) return "no";
    return "ok";
}
