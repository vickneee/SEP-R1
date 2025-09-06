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
    <Card className="flex justify-center bg-gray-800 text-white font-[cursive] text-xs px-5 h-45 w-40 relative">
      {title}
    </Card>
  );
}
