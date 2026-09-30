import { NextResponse } from "next/server";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "कृपया सही JSON जानकारी भेजें।" }, { status: 400 });
    }

    if (!isRecord(body) || typeof body.text !== "string") {
        return NextResponse.json({ error: "कृपया पहचानने के लिए टेक्स्ट भेजें।" }, { status: 400 });
    }

    if (body.text.length > 300) {
        return NextResponse.json({ error: "टेक्स्ट 300 अक्षरों तक सीमित रखें।" }, { status: 400 });
    }

    const normalizedText = body.text.toLocaleLowerCase("hi-IN");
    const matches = [
        { schemeId: "ladli-behna", keywords: ["लाडली", "बहना", "ladli", "laadli", "behna", "behen"] },
        { schemeId: "ladli-laxmi", keywords: ["लक्ष्मी", "laxmi", "lakshmi"] },
        { schemeId: "kanya-vivah", keywords: ["कन्या विवाह", "निकाह", "vivah", "kanya"] },
        { schemeId: "sambal", keywords: ["संबल", "sambal"] },
        { schemeId: "pension", keywords: ["पेंशन", "pension"] },
        { schemeId: "pm-awas", keywords: ["आवास", "awas", "घर", "ghar"] },
        { schemeId: "ayushman", keywords: ["आयुष्मान", "ayushman", "स्वास्थ्य"] },
        { schemeId: "kisan", keywords: ["किसान", "kisan", "खेती", "pm-kisan", "pm kisan"] },
        { schemeId: "certificate", keywords: ["प्रमाण पत्र", "certificate", "income certificate"] },
        { schemeId: "ration", keywords: ["राशन", "ration"] },
        { schemeId: "sikho-kamao", keywords: ["सीखो", "कमाओ", "sikho", "kamao", "युवा"] },
    ];
    const detected = matches.find(({ keywords }) => keywords.some((keyword) => normalizedText.includes(keyword)));

    return NextResponse.json({
        schemeId: detected?.schemeId ?? "unknown",
        demo: true,
    });
}
