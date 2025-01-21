import React from "react";
import { Button } from "@/components/ui/button";
import Test from "./Test";
import authService from "@/features/authentication/services/authService";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="text-lg font-bold text-red-500">
      <p>hOME</p>
      <Button>cLICK ME</Button>
      <hr></hr>
      <button
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          const data = await authService.test().catch((err) => {
            console.log(err);

            //redirect to login page
            navigate("/login");
          });
          console.log("Test: " + data);
        }}
      >
        Test
      </button>
    </div>
  );
};

export default Home;
