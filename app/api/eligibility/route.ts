import { NextResponse } from "next/server";
import { assess } from "@/lib/eligibility";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableNumberOrString(value: unknown): value is number | string | null {
    return value === null || typeof value === "number" || typeof value === "string";
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "कृपया सही JSON जानकारी भेजें।" }, { status: 400 });
    }

    if (!isRecord(body)) {
        return NextResponse.json({ error: "कृपया सही जानकारी भेजें।" }, { status: 400 });
    }

    const { age, gender, income, land } = body;
    if (
        typeof age !== "number" || !Number.isFinite(age) || age < 0 || age > 120 ||
        typeof gender !== "string" ||
        !isNullableNumberOrString(income) ||
        !isNullableNumberOrString(land)
    ) {
        return NextResponse.json({ error: "आयु, लिंग, आय और भूमि की जानकारी जाँचें।" }, { status: 400 });
    }

    let normalizedIncome: number | null;
    if (income === null) {
        normalizedIncome = null;
    } else if (typeof income === "number") {
        normalizedIncome = income;
    } else if (income.trim() === "") {
        normalizedIncome = null;
    } else {
        normalizedIncome = Number(income);
        if (!Number.isFinite(normalizedIncome)) {
            return NextResponse.json({ error: "आय की जानकारी संख्या में भेजें।" }, { status: 400 });
        }
    }

    const normalizedLand = land === null
        ? null
        : typeof land === "number"
            ? String(land)
            : land.trim() === ""
                ? null
                : land;

    const result = body.schemeId === undefined || body.schemeId === "ladli-behna"
        ? assess({ age, gender, income: normalizedIncome, land: normalizedLand })
        : "more";
    return NextResponse.json({
        result,
        note: "Prototype Eligibility Assessment. अंतिम पात्रता संबंधित प्राधिकरण द्वारा तय की जाती है।",
    });
}
