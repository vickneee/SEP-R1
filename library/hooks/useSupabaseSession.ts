"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"


export default function useSupabaseSession() {
    const supabase = createClient();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };

        fetchSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [supabase]);

    return { session, loading, supabase };
}
