import { HeartPulse } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";

import authBackground from "@/assets/images/auth/authBackground.jpg";

const AuthLayout = () => {
  return (
    <div className=" w-full min-h-[100svh] h-full flex flex-col ">
      <div className="grid grid-cols-12   flex-1 p-4">
        {/* this should take h full but not taking  */}
        <div className="h-full col-span-full lg:col-span-5  p-4 flex flex-col">
          <a
            href="/"
            className="flex items-center gap-2 "
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#9227EC] text-sidebar-primary-foreground">
              <HeartPulse className="size-4 bg-[#9227EC]" />
            </div>
            {/* <div className="flex flex-col gap-0.5 leading-none"> */}
            <span className="font-semibold text-lg">Emsure</span>
            {/* <span className="">v1.0.0</span> */}
            {/* </div> */}
          </a>
          <div className=" w-full flex-1 flex flex-col justify-center items-center">
            <Outlet />
          </div>
        </div>
        <div className="h-full col-span-7 lg:block hidden">
          <img
            src={authBackground}
            alt="background"
            className="h-full w-full object-cover rounded-3xl "
          ></img>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
