import { NextResponse } from "next/server";
import { extendReservation } from "@/app/books/extendedAction";

export async function POST(request: Request, { params }: { params: { reservationId: string } }) {
    const reservationId = Number(params.reservationId); // Convert string to number

    if (isNaN(reservationId)) {
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
