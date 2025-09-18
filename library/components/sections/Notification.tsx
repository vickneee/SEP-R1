import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Bell, CheckIcon } from "lucide-react";
import {
  getDueDateNotification,
  getOverdueNotification,
} from "@/components/sections/NotificationAction";
import { useEffect, useState } from "react";
import { getBookById } from "@/app/books/bookActions";

type notification = {
  reservation_id: number;
  book_id: number;
  due_date: string;
};

export default function NotificationSection() {
  const [dueDateNotifications, setDueDateNotifications] = useState<
    notification[]
  >([]);

  const [overdueNotifications, setOverdueNotifications] = useState<
    notification[]
  >([]);

  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [OverdueError, setOverdueError] = useState<string | null>(null);

  const [dueDateBookTitles, setDueDateBookTitles] = useState<
    Record<number, string>
  >({});
  const [overdueBookTitles, setOverdueBookTitles] = useState<
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

  const fetchOverdueNotifications = async () => {
    const result = await getOverdueNotification();
    if (result?.error) {
      setOverdueError(result.error);
    } else if (result) {
      setOverdueNotifications(result.notifications || []);
    }
  };

  const fetchBookTitles = async (bookIds: number[]) => {
    const results = await Promise.all(
      bookIds.map(async (id) => {
        try {
          const res = await getBookById(id);
          if (res.error) throw new Error("Failed to fetch book");
          return { id, title: res.book.title || "Untitled" };
        } catch (error) {
          return { id, title: "Unknown Title" };
        }
      })
    );

    return Object.fromEntries(results.map(({ id, title }) => [id, title]));
  };

  const loadBookTitles = async (
    bookIds: number[],
    setTitles: React.Dispatch<React.SetStateAction<Record<number, string>>>
  ) => {
    const titles = await fetchBookTitles(bookIds);
    setTitles(titles);
  };

  useEffect(() => {
    fetchDueDateNotifications();
    fetchOverdueNotifications();
  }, []);

  useEffect(() => {
    if (overdueNotifications.length > 0) {
      const bookIds = overdueNotifications.map((n) => n.book_id);
      const bookTitles = fetchBookTitles(bookIds);
      loadBookTitles(bookIds, setOverdueBookTitles);
    }
  }, [overdueNotifications]);

  useEffect(() => {
    if (dueDateNotifications.length > 0) {
      const bookIds = dueDateNotifications.map((n) => n.book_id);
      const bookTitles = fetchBookTitles(bookIds);
      loadBookTitles(bookIds, setDueDateBookTitles);
    }
  }, [dueDateNotifications]);

  const hasNotifications =
    dueDateNotifications.length > 0 || overdueNotifications.length > 0;

  console.log(dueDateNotifications);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="p-2 relative">
          <Bell width={16} />
          {hasNotifications && (
            <div className="absolute -top-0 -right-1 flex h-4 w-4 items-center justify-center ">
              {dueDateNotifications.length + overdueNotifications.length}
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
            {!hasNotifications && <p>You have no notifications.</p>}

            {hasNotifications &&
              overdueNotifications?.map(
                ({ reservation_id, book_id, due_date }) => (
                  <div
                    key={reservation_id}
                    className="flex items-center justify-between gap-4"
                  >
                    <p>
                      The book{" "}
                      <strong>
                        {overdueBookTitles[book_id] || "Loading..."}
                      </strong>
                      was due on{" "}
                      <strong>
                        {new Date(due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                      . Please return it as soon as possible.
                    </p>
                    <Button variant="ghost" size="icon">
                      <CheckIcon className="h-5 w-5" />
                    </Button>
                  </div>
                )
              )}
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
                    <Button variant="ghost" size="icon">
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
