import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

export function AppBreadcrumb() {
  const pathname = useLocation().pathname;
  const paths = pathname.split("/").filter((x) => x);
  console.log(paths);
  console.log(paths.slice(0, 1 + 1).join("/"));
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths &&
          paths.length > 0 &&
          paths.map((path, index) => {
            if (index === 0) {
              return (
                <>
                  <BreadcrumbItem key={index}>
                    <span>{path}</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              );
            }
            if (index === paths.length - 1) {
              return (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink href="#">{path}</BreadcrumbLink>
                </BreadcrumbItem>
              );
            }
            return (
              <>
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    href={`/${paths.slice(0, index + 1).join("/")}/`}
                  >
                    {path}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            );
          })}
        {/* <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Data Fetching</BreadcrumbPage>
        </BreadcrumbItem> */}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
