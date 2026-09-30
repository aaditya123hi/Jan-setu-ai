import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
    params: Promise<{ refId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { refId } = await context.params;
    if (!/^JS-2026-\d{4}$/.test(refId)) {
        return NextResponse.json({ error: "आवेदन नहीं मिला।" }, { status: 404 });
    }

    try {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from("applications")
            .select("ref_id,status,created_at")
            .eq("ref_id", refId)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: "स्थिति अभी उपलब्ध नहीं है।" }, { status: 503 });
        }
        if (!data) {
            return NextResponse.json({ error: "आवेदन नहीं मिला।" }, { status: 404 });
        }

        return NextResponse.json({
            refId: data.ref_id,
            status: data.status,
            createdAt: data.created_at,
        });
    } catch {
        return NextResponse.json({ error: "स्थिति अभी उपलब्ध नहीं है।" }, { status: 503 });
    }
}
