import { NextResponse } from "next/server";
import { extendReservation } from "@/app/books/extendedAction";

export async function POST(request: Request, { params }: { params: { reservationId: number } }) {
    try {
        const updated = await extendReservation(params.reservationId);
        return NextResponse.json(updated, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
