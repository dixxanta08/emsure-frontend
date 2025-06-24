import React from "react";
import acmeLogo from "@/assets/images/logo-acme.png";
import quantumLogo from "@/assets/images/logo-quantum.png";
import echoLogo from "@/assets/images/logo-echo.png";
import pulseLogo from "@/assets/images/logo-pulse.png";
import celestialLogo from "@/assets/images/logo-celestial.png";
import apexLogo from "@/assets/images/logo-apex.png";

const LogoTicker = () => {
  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-5">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <div className="flex gap-14 flex-none">
            <img src={acmeLogo} alt="acme logo" className="logo-ticker-image" />
            <img
              src={quantumLogo}
              alt="quantum logo"
              className="logo-ticker-image"
            />
            <img src={echoLogo} alt="echo logo" className="logo-ticker-image" />
            <img
              src={pulseLogo}
              alt="pulse logo"
              className="logo-ticker-image"
            />
            <img
              src={celestialLogo}
              alt="celestial logo"
              className="logo-ticker-image"
            />
            <img src={apexLogo} alt="apex logo" className="logo-ticker-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;
