export const mockReservations = [
    {
        reservation_id: 1,
        books: { title: "The Hobbit", author: "J.R.R. Tolkien" },
        reservation_date: "2025-08-01T10:00:00Z",
        due_date: "2025-08-20T10:00:00Z",
        return_date: null,
        status: "active",
    },
    {
        reservation_id: 2,
        books: { title: "Clean Code", author: "Robert C. Martin" },
        reservation_date: "2025-07-15T09:00:00Z",
        due_date: "2025-08-05T09:00:00Z",
        return_date: "2025-08-03T15:30:00Z",
        status: "returned",
    },
    {
        reservation_id: 3,
        books: { title: "Atomic Habits", author: "James Clear" },
        reservation_date: "2025-07-20T12:00:00Z",
        due_date: "2025-08-01T12:00:00Z",
        return_date: null,
        status: "overdue",
    },
];
