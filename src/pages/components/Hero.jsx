import { ArrowRight } from "lucide-react";
import React from "react";
import LockImage from "@/assets/images/hero4.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-8 pb-20 lg:pt-5 lg:pb-10 bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#9789e6,#fbfcff_100%)] overflow-x-clip">
      <div className="container mx-auto px-5">
        <div className="lg:flex items-center">
          <div className="lg:w-[478px]">
            <div className="landing_page-tag">Introducing Beta 0.1</div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text mt-6">
              Your Insurance, Simplified
            </h1>
            <p className="text-xl text-[#010D3E] tracking-tight mt-6">
              Manage claims and coverage with ease – fast, simple, and
              stress-free for your team.
            </p>
            <div className="flex gap-1 items-center mt-[30px]">
              <button
                className="landing_btn landing_btn-primary"
                onClick={() => navigate("/login")}
              >
                Get started now
              </button>
              <button className="landing_btn landing_btn-text gap-1">
                <span>Learn more</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-20 lg:mt-0  lg:h-[512px] xl:h-[648px] lg:flex-1 relative">
            <img
              src={LockImage}
              alt="hero"
              className="lg:absolute lg:h-full lg:w-auto lg:max-w-none lg:left-6 xl:left-24"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
