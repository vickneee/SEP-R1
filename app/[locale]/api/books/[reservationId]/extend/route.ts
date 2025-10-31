import {NextRequest, NextResponse} from "next/server";
import { extendReservation } from "@/app/[locale]/books/extendedAction";

export async function POST(request: NextRequest,
                           context: { params: Promise<{ reservationId: string }> }
) {
    const {reservationId} = await context.params
    const id = Number(reservationId);

    if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    try {
        const updated = await extendReservation(reservationId);
        return NextResponse.json(updated, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
