import React from "react";
import ProductImage from "@/assets/images/productshowcase.png";
import PyramidImage from "@/assets/images/hero2.png";
import TubeImage from "@/assets/images/hero3.png";

const ProductShowcase = () => {
  return (
    <section className="bg-gradient-to-b from-[#ffffff] to-[#d2dcff] py-24 overflow-x-clip">
      <div className="container mx-auto px-5">
        <div className="max-w-[540px] mx-auto">
          <div className="flex justify-center">
            <div className="landing_page-tag">Simplify your insurance</div>
          </div>
          <h2 className="text-center text-3xl md:text-[54px] md:leading-[72px] font-bold tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text mt-5">
            Streamline insurance for your organization
          </h2>
          <p className="text-center text-[22px] leading-[30px] tracking-tight text-[#010D3E] mt-5">
            Effortlessly manage claims and coverage with a fast, simple, and
            stress-free solution.
          </p>
        </div>
        <div className="relative">
          <img src={ProductImage} alt="product showcase" className="mt-10" />
          {/* <img
            src={PyramidImage}
            alt="pyramid "
            className="hidden md:block absolute -right-24 -top-32"
            height={156}
            width={156}
          />
          <img
            src={TubeImage}
            alt="tube"
            className="hidden md:block absolute bottom-24 -left-28"
            height={144}
            width={144}
          /> */}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
