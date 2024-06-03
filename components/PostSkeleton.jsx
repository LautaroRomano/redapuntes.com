import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Skeleton,
} from "@nextui-org/react";

export default function PostSkeleton() {
  return (
    <Card className="mb-4">
      <CardHeader className="justify-between">
        <div className="flex gap-5 w-full">
          <Skeleton className="flex rounded-full w-12 h-12" />
        </div>
      </CardHeader>

      <CardBody className="px-3 py-0 text-small text-default-400">
        <div className="space-y-3">
          <Skeleton className="w-3/5 rounded-lg">
            <div className="h-3 w-3/5 rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg">
            <div className="h-3 w-4/5 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  );
}
