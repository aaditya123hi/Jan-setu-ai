import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

    if (!isRecord(body) || body.consent !== true) {
        return NextResponse.json({ error: "सबमिट करने से पहले सहमति देना ज़रूरी है।" }, { status: 400 });
    }

    const { schemeId, applicantName, maskedAadhaar, eligibilityResult } = body;
    if (
        typeof schemeId !== "string" || schemeId.trim() === "" ||
        typeof applicantName !== "string" ||
        typeof maskedAadhaar !== "string" || !/^XXXX-XXXX-\d{4}$/.test(maskedAadhaar) ||
        (eligibilityResult !== "ok" && eligibilityResult !== "no" && eligibilityResult !== "more")
    ) {
        return NextResponse.json({ error: "सबमिशन की जानकारी जाँचें।" }, { status: 400 });
    }

    try {
        const supabase = getSupabaseServerClient();
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const refId = `JS-2026-${randomInt(1000, 10000)}`;
            const { data, error } = await supabase
                .from("applications")
                .insert({
                    ref_id: refId,
                    scheme_id: schemeId,
                    applicant_name: null,
                    masked_aadhaar: maskedAadhaar,
                    eligibility_result: eligibilityResult,
                    consent: true,
                })
                .select("ref_id,status,created_at")
                .single();

            if (!error && data) {
                return NextResponse.json({
                    refId: data.ref_id,
                    status: data.status,
                    createdAt: data.created_at,
                    demo: true,
                });
            }

            if (error?.code === "23505") continue;
            return NextResponse.json({ error: "सबमिशन अभी उपलब्ध नहीं है। कृपया डेमो मोड में जारी रखें।" }, { status: 503 });
        }

        return NextResponse.json({ error: "रेफरेंस नंबर नहीं बन पाया। कृपया डेमो मोड में जारी रखें।" }, { status: 503 });
    } catch {
        return NextResponse.json({ error: "सबमिशन सेवा उपलब्ध नहीं है। कृपया डेमो मोड में जारी रखें।" }, { status: 503 });
    }
}
