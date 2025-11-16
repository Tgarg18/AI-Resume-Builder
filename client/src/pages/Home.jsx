import React from "react";
import Banner from "../components/Home/Banner";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/features";
import CallToAction from "../components/Home/CallToAction";
import Footer from "../components/Home/Footer";

const Home = () => {
  return (
    <div>
      <Banner />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
