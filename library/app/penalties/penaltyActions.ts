"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database";

type PenaltyStatus = Database['public']['Enums']['penalty_status'];

export interface UserPenalty {
  penalty_id: number;
  reservation_id: number | null;
  amount: number;
  reason: string;
  status: PenaltyStatus;
  created_at: string;
  book_title: string | null;
  book_author: string | null;
  due_date: string | null;
  return_date: string | null;
}

export interface UserReservationStatus {
  can_reserve: boolean;
  pending_penalty_count: number;
  pending_penalty_amount: number;
  restriction_reason: string | null;
}

/**
 * Get all penalties for a user
 */
export const getUserPenalties = async (userId?: string): Promise<{
  penalties: UserPenalty[] | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // If no userId provided, get current user
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { penalties: null, error: "User not authenticated" };
      }
      targetUserId = userData.user.id;
    }

    const { data, error } = await supabase.rpc('get_user_penalties', {
      user_uuid: targetUserId
    });

    if (error) {
      console.error("Error fetching user penalties:", error);
      return { penalties: null, error: error.message };
    }

    return { penalties: data, error: null };
  } catch (err) {
    console.error("Exception in getUserPenalties:", err);
    return { penalties: null, error: "Failed to fetch penalties" };
  }
};

/**
 * Check if user can make reservations and get restriction details
 */
export const checkUserCanReserve = async (userId?: string): Promise<{
  status: UserReservationStatus | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // If no userId provided, get current user
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { status: null, error: "User not authenticated" };
      }
      targetUserId = userData.user.id;
    }

    const { data, error } = await supabase.rpc('can_user_reserve_books', {
      user_uuid: targetUserId
    });

    if (error) {
      console.error("Error checking user reservation status:", error);
      return { status: null, error: error.message };
    }

    // RPC returns array, get first result
    const result = data?.[0];
    if (!result) {
      return { status: null, error: "No data returned" };
    }

    return { status: result, error: null };
  } catch (err) {
    console.error("Exception in checkUserCanReserve:", err);
    return { status: null, error: "Failed to check reservation status" };
  }
};

/**
 * Pay a penalty (librarian only)
 */
export const payPenalty = async (penaltyId: number): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Verify user is librarian (RPC will also check, but we check here too)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || userProfile?.role !== "librarian") {
      return { success: false, error: "Only librarians can manage penalties" };
    }

    const { data, error } = await supabase.rpc('pay_penalty', {
      penalty_uuid: penaltyId
    });

    if (error) {
      console.error("Error paying penalty:", error);
      return { success: false, error: error.message };
    }

    return { success: data === true, error: null };
  } catch (err) {
    console.error("Exception in payPenalty:", err);
    return { success: false, error: "Failed to pay penalty" };
  }
};

/**
 * Waive a penalty (librarian only)
 */
export const waivePenalty = async (penaltyId: number): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Verify user is librarian (RPC will also check, but we check here too)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || userProfile?.role !== "librarian") {
      return { success: false, error: "Only librarians can manage penalties" };
    }

    const { data, error } = await supabase.rpc('waive_penalty', {
      penalty_uuid: penaltyId
    });

    if (error) {
      console.error("Error waiving penalty:", error);
      return { success: false, error: error.message };
    }

    return { success: data === true, error: null };
  } catch (err) {
    console.error("Exception in waivePenalty:", err);
    return { success: false, error: "Failed to waive penalty" };
  }
};

/**
 * Get all penalties (librarian only) - for management interface
 */
export const getAllPenalties = async (): Promise<{
  penalties: (UserPenalty & { user_name: string; user_email: string })[] | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Verify user is librarian
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { penalties: null, error: "User not authenticated" };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || userProfile?.role !== "librarian") {
      return { penalties: null, error: "Only librarians can view all penalties" };
    }

    // Get penalties with user information
    const { data, error } = await supabase
      .from("penalties")
      .select(`
        penalty_id,
        reservation_id,
        amount,
        reason,
        status,
        created_at,
        users!inner(first_name, last_name, email),
        reservations(
          due_date,
          return_date,
          books(title, author)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all penalties:", error);
      return { penalties: null, error: error.message };
    }

    // Transform data to match expected format
    const transformedPenalties = data?.map(penalty => ({
      penalty_id: penalty.penalty_id,
      reservation_id: penalty.reservation_id,
      amount: penalty.amount,
      reason: penalty.reason,
      status: penalty.status,
      created_at: penalty.created_at,
      book_title: penalty.reservations?.books?.title || null,
      book_author: penalty.reservations?.books?.author || null,
      due_date: penalty.reservations?.due_date || null,
      return_date: penalty.reservations?.return_date || null,
      user_name: `${penalty.users.first_name} ${penalty.users.last_name}`,
      user_email: penalty.users.email
    }));

    return { penalties: transformedPenalties || [], error: null };
  } catch (err) {
    console.error("Exception in getAllPenalties:", err);
    return { penalties: null, error: "Failed to fetch all penalties" };
  }
};

/**
 * Process overdue books (creates penalties) - typically called by scheduled job
 */
export const processOverdueBooks = async (): Promise<{
  processed_count: number;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Verify user is librarian (only librarians should be able to trigger this)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { processed_count: 0, error: "User not authenticated" };
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError || userProfile?.role !== "librarian") {
      return { processed_count: 0, error: "Only librarians can process overdue books" };
    }

    const { data, error } = await supabase.rpc('process_overdue_books');

    if (error) {
      console.error("Error processing overdue books:", error);
      return { processed_count: 0, error: error.message };
    }

    return { processed_count: data || 0, error: null };
  } catch (err) {
    console.error("Exception in processOverdueBooks:", err);
    return { processed_count: 0, error: "Failed to process overdue books" };
  }
};