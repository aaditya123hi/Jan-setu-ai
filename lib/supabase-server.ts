import "server-only";

import { createClient } from "@supabase/supabase-js";

type ApplicationRow = {
    id: string;
    ref_id: string;
    scheme_id: string;
    applicant_name: string | null;
    masked_aadhaar: string | null;
    eligibility_result: string | null;
    consent: boolean;
    status: string;
    created_at: string;
};

type ApplicationInsert = {
    id?: string;
    ref_id: string;
    scheme_id: string;
    applicant_name?: string | null;
    masked_aadhaar?: string | null;
    eligibility_result?: string | null;
    consent: boolean;
    status?: string;
    created_at?: string;
};

type Database = {
    public: {
        Tables: {
            applications: {
                Row: ApplicationRow;
                Insert: ApplicationInsert;
                Update: Partial<ApplicationInsert>;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};

export function getSupabaseServerClient() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error("Supabase server configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    return createClient<Database>(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
