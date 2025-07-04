import { ArrowRight, MenuIcon } from "lucide-react";
import React from "react";
import Logo from "@/assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 backdrop-blur-sm">
      <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-2">
        <p className="text-white/60 hidden md:block">
          Simplify insurance management for your organization
        </p>
        <div className="inline-flex gap-1 items-center">
          <p>Get started today</p>
          <ArrowRight
            className="w-4 h-4 inline-flex justify-center items-center cursor-pointer"
            onClick={() => navigate("/login")}
          />
        </div>
      </div>
      <div className="py-5">
        <div className="container mx-auto px-5">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img src={Logo} alt="emsure logo" height={40} width={40} />
            </Link>
            <MenuIcon className="w-5 h-5 md:hidden" />
            <nav className="hidden md:flex gap-6 text-black/60 items-center">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/features">Features</Link>
              <Link to="/plans">Plans</Link>
              <button
                onClick={() => navigate("/login")}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
