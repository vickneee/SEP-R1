import { NextResponse } from "next/server";
import { extendReservation } from "@/app/books/extendedAction";

export async function POST(request: Request, { params }: { params: { reservationId: number } }) {
    try {
        const updated = await extendReservation(params.reservationId);
        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        // @ts-ignore
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
