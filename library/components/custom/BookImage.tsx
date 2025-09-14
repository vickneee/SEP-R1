import { Card } from "@/components/ui/card";

interface BookImageProps {
  title: string;
  category: string;
}

export default function BookImage({ title, category }: BookImageProps) {
  return (
    <Card className="rounded-md flex justify-center bg-gray-800 text-white text-center px-2 w-full h-full">
      {title}
    </Card>
  );
}
