import React from "react";
import { Button } from "@/components/ui/button";
import Test from "./Test";
import authService from "@/features/authentication/services/authService";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LogoTicker from "./components/LogoTicker";
import ProductShowcase from "./components/ProductShowcase";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <Hero />
      <LogoTicker />
      <ProductShowcase />
      <Testimonials />
      <Footer />
    </>
  );
};

export default Home;
