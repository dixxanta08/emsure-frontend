import React, { useMemo } from "react";
import {
  Building,
  Building2,
  Calendar,
  ChevronRight,
  Group,
  HeartPulse,
  Home,
  Inbox,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
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
import { Popover, Button } from "antd";

const MainLayout = () => {
  const { loggedInUser, logout } = useAuth();
  const userRole = loggedInUser.roleName;

  const navigate = useNavigate();
  const insuranceNavMain = [
    {
      title: "Dashboard",
      url: "/main-dashboard",
      icon: Home,
      allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN"],
    },
    {
      title: "People & Organizations",
      url: "#",
      icon: UsersRound,
      items: [
        {
          title: "Insurance Staff",
          url: "people-organizations/insurance-workers",

          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN"],
        },
        {
          title: "Agents",
          url: "/people-organizations/agents",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN"],
        },
        {
          title: "Client Organizations",
          url: "/people-organizations/companies", // These are the organizations buying the policies
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        // {
        //   title: "Employees",
        //   url: "#", // Employees within client organizations
        //   allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        // },
      ],
    },
    {
      title: "Insurance Management",
      url: "#",
      icon: HeartPulse,
      items: [
        {
          title: "Plans",
          url: "/insurance-management/plans",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        {
          title: "Policies",
          url: "/insurance-management/policies",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        {
          title: "Benefits",
          url: "/insurance-management/benefits",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        {
          title: "Benefit Types",
          url: "/insurance-management/benefit-types",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        {
          title: "Medical Facilities",
          url: "/insurance-management/medical-facilities",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
      ],
    },
    {
      title: "Subscription Management",
      url: "#",
      icon: HeartPulse,
      items: [
        {
          title: "Plan Subscriptions",
          url: "/subscription-management/plan-subscriptions",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
        {
          title: "Claims",
          url: "/subscription-management/claims",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },

        {
          title: "Payments",
          url: "/subscription-management/payments",
          allowedRoles: ["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"],
        },
      ],
    },

    {
      title: "Dashboard",
      url: "/agent-dashboard",
      icon: UsersRound,
      allowedRoles: ["AGENT"],
    },
    {
      title: "Company Report",
      url: "/report/company",
      icon: Building2,
      allowedRoles: ["AGENT", "INSURANCE_WORKER", "SUPER_ADMIN"],
    },
  ];
  const clientNavMain = [
    {
      title: "Dashboard",
      url: "/employee-dashboard",
      icon: UsersRound,
      allowedRoles: ["EMPLOYEE"],
    },
    {
      title: "Dashboard",
      url: "/company-dashboard",
      icon: UsersRound,
      allowedRoles: ["EMPLOYER"],
    },
    {
      title: "Company Detail",
      url: "/company",
      icon: Building,
      allowedRoles: ["EMPLOYEE", "EMPLOYER"],
    },
    {
      title: "Company Employees",
      url: `/employees`,
      icon: Group,
      allowedRoles: ["EMPLOYER"],
    },
    {
      title: "Explore Plans",
      url: "/explore-plans",
      icon: ChevronRight,
      allowedRoles: ["EMPLOYEE", "EMPLOYER"],
    },

    {
      title: "Claims",
      url: "/claims",
      icon: UsersRound,
      allowedRoles: ["EMPLOYEE", "EMPLOYER"],
    },
    {
      title: "Subscriptions",
      url: "/subscribed-plans",
      icon: UsersRound,
      allowedRoles: ["EMPLOYEE", "EMPLOYER"],
    },
  ];

  const filterNavItems = (navItems) => {
    return navItems
      .map((section) => {
        const filteredItems = section.items?.filter((item) =>
          item.allowedRoles?.includes(userRole)
        );
        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter(
        (section) =>
          section.items?.length > 0 || section.allowedRoles?.includes(userRole)
      );
  };

  // Select Navigation Based on Role
  const selectedNav = useMemo(() => {
    if (["INSURANCE_WORKER", "SUPER_ADMIN", "AGENT"].includes(userRole)) {
      return filterNavItems(insuranceNavMain);
    } else if (["EMPLOYEE", "EMPLOYER"].includes(userRole)) {
      return filterNavItems(clientNavMain);
    }
    return [];
  }, [userRole]);
  return (
    <SidebarProvider>
      <AppSidebar navMain={selectedNav} />
      <SidebarInset>
        <header className="z-[1] flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* <AppBreadcrumb /> */}
          <div className="w-full h-full  flex items-center justify-end px-4 gap-8">
            <Bell className="h-5 w-5 text-[#18181b] hover:text-[#71717a] cursor-pointer" />
            <Popover
              content={
                <Button
                  type="primary"
                  danger
                  onClick={logout}
                  className="w-full"
                >
                  Logout
                </Button>
              }
              trigger="hover"
              placement="bottom"
              // arrowPointAtCenter
            >
              <Avatar
                className=""
                onClick={() =>
                  loggedInUser?.roleName === "EMPLOYEE" ||
                  loggedInUser?.roleName === "EMPLOYER"
                    ? navigate("/user-profile")
                    : navigate("/profile")
                }
              >
                <AvatarImage src={loggedInUser.profileImageURL} />

                <AvatarFallback>
                  {loggedInUser.name.split(" ")[0].slice(0, 1).toUpperCase()}
                  {loggedInUser.name.split(" ")[1]?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Popover>
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
