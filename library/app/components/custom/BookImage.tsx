import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface BookImageProps {
  title: string;
  category: string;
}

/*
<Badge className="absolute top-0 left-0 text-[0.625rem] bg-orange-500">
        {category}
      </Badge>
      */
export default function BookImage({ title, category }: BookImageProps) {
  return (
    <Card className="rounded-md flex justify-center bg-gray-800 text-white text-center px-2 w-full h-full">
      {title}
    </Card>
  );
}
