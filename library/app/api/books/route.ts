import { NextResponse } from "next/server";
import { createBook } from "@/app/actions/bookActions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { book, error } = await createBook(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}