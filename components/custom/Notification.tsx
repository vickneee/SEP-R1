import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckIcon } from "lucide-react";
import {
  getDueDateNotification,
  markReminderSentAsTrue,
} from "@/components/custom/NotificationAction";
import { useCallback, useEffect, useState } from "react";
import { getBookById } from "@/app/[locale]/books/bookActions";
import { useNotification } from "@/context/NotificationContext";

type notification = {
  reservation_id: number;
  book_id: number;
  due_date: string;
};

export default function NotificationSection() {
  const { refreshKey } = useNotification();
  const [dueDateNotifications, setDueDateNotifications] = useState<
    notification[]
  >([]);

  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [dueDateBookTitles, setDueDateBookTitles] = useState<
    Record<number, string>
  >({});

  const fetchDueDateNotifications = async () => {
    const result = await getDueDateNotification();
    if (result?.error) {
      setDueDateError(result.error);
    } else if (result) {
      setDueDateNotifications(result.notifications || []);
    }
  };

  const fetchBookTitles = useCallback(async (bookIds: number[]) => {
    const results = await Promise.all(
      bookIds.map(async (id) => {
        try {
          const res = await getBookById(id);
          if (res.error) throw new Error("Failed to fetch book");
          return { id, title: res.book.title || "Untitled" };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return { id, title: "Unknown Title" };
        }
      })
    );

    return Object.fromEntries(results.map(({ id, title }) => [id, title]));
  }, []);

  const loadBookTitles = useCallback(
    async (
      bookIds: number[],
      setTitles: React.Dispatch<React.SetStateAction<Record<number, string>>>
    ) => {
      const titles = await fetchBookTitles(bookIds);
      setTitles(titles);
    },
    [fetchBookTitles]
  );

  useEffect(() => {
    fetchDueDateNotifications();
  }, [refreshKey]);

  useEffect(() => {
    if (dueDateNotifications.length > 0) {
      const bookIds = dueDateNotifications.map((n) => n.book_id);
      fetchBookTitles(bookIds);
      loadBookTitles(bookIds, setDueDateBookTitles);
    }
  }, [dueDateNotifications, loadBookTitles, fetchBookTitles]);

  const hasNotifications = dueDateNotifications.length > 0;

  const markAsRead = async (reservationId: number) => {
    const result = await markReminderSentAsTrue(reservationId);
    if (result?.error) {
      console.log(result.error);
    }
    fetchDueDateNotifications();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} data-testid="bell-icon" />
          {hasNotifications && (
            <div className="absolute -top-0 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {dueDateNotifications.length}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]" sideOffset={37}>
        <div className="flex p-4">
          <h3 className="text-lg font-medium">Notifications</h3>
        </div>
        <Separator />
        <ScrollArea>
          <div className="space-y-4 p-4">
            {dueDateError && (
              <p className="text-red-500 font-medium">
                Failed to load notifications: {dueDateError}
              </p>
            )}
            {!hasNotifications && <p>You have no notifications.</p>}

            {hasNotifications &&
              dueDateNotifications?.map(
                ({ reservation_id, book_id, due_date }) => (
                  <div
                    key={reservation_id}
                    className="flex items-center justify-between gap-4"
                  >
                    <p>
                      The book{" "}
                      <strong>
                        {dueDateBookTitles[book_id] || "Loading..."}
                      </strong>{" "}
                      is due on{" "}
                      <strong>
                        {new Date(due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                      . Please make sure to return it by then.
                    </p>
                    <Button
                      onClick={() => markAsRead(reservation_id)}
                      variant="ghost"
                      size="icon"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </Button>
                  </div>
                )
              )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
