import { POST } from "@/app/[locale]/api/books/[reservationId]/extend/route";
import { extendReservation } from "@/app/[locale]/books/extendedAction";
import { NextRequest } from "next/server";

jest.mock("@/app/[locale]/books/extendedAction", () => ({
    extendReservation: jest.fn(),
}));

describe("POST /extend/:reservationId", () => {
    const mockExtendReservation = extendReservation as jest.Mock;

    it("returns 400 for invalid reservation ID", async () => {
        const request = {} as NextRequest;
        const context = { params: Promise.resolve({ reservationId: "abc" }) };

        const response = await POST(request, context);

        const json = await response.json();
        expect(response.status).toBe(400);
        expect(json).toEqual({ error: "Invalid reservation ID" });
    });

    it("calls extendReservation and returns success", async () => {
        const request = {} as NextRequest;
        const context = { params: Promise.resolve({ reservationId: "123" }) };

        mockExtendReservation.mockResolvedValueOnce({ success: true, error: null });

        const response = await POST(request, context);

        const json = await response.json();
        expect(mockExtendReservation).toHaveBeenCalledWith("123");
        expect(response.status).toBe(200);
        expect(json).toEqual({ success: true, error: null });
    });
});
