export type BorrowedBook = {
    reservation_id: number;
    user_name: string;
    user_email: string;
    book_title: string;
    book_author: string;
    due_date: string;
    extended: boolean;
    status: 'active' | 'extended' | 'returned' | 'overdue' | 'cancelled';
    user_id: string;
};
