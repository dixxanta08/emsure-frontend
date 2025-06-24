import React from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const MainLayout = () => {
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="z-[1] flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* <AppBreadcrumb /> */}
          <div className="w-full h-full  flex items-center justify-end px-4 gap-8">
            <Bell className="h-5 w-5 text-[#18181b] hover:text-[#71717a] cursor-pointer" />
            <Avatar className="" onClick={() => navigate("/profile")}>
              <AvatarImage src={loggedInUser.profileImageURL} />
              <AvatarFallback>
                {loggedInUser.name.split(" ")[0].slice(0, 1).toUpperCase()}
                {loggedInUser.name.split(" ")[1]?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="h-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
