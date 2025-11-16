import React, { useState } from "react";
import logo from "../assets/logo.svg";
import { Link, useSearchParams } from "react-router-dom";
import api from "../configs/api";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  // const [state, setState] = useState("login");
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get("state") || "login";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    // console.log(e);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // console.log(e);
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/users/${state}`, formData);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message);
    } catch (error) {
      toast(error?.response?.data?.message || error.message);
    }
  };

  console.log("getting state", state);

  return (
    <div className="relative flex justify-center h-screen items-center">
      <Link
        to="/"
        className="absolute top-4 left-35 border border-black rounded-full pb-2 pr-4 pl-4"
      >
        <img src={logo} alt="logo-image" className="h-11 w-auto" />
      </Link>
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign Up"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">Please Sign In to continue</p>
        {/* state is === Sign Up  */}
        {state !== "login" && (
          <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user-round-icon lucide-user-round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <input
              value={formData.name}
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="border-none outline-none ring-0"
              required
            />
          </div>
        )}
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-mail-icon lucide-mail"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>

          <input
            value={formData.email}
            type="email"
            name="email"
            placeholder="Email ID"
            onChange={handleChange}
            className="border-none outline-none ring-0"
            required
          />
        </div>
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-lock-icon lucide-lock"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <input
            value={formData.password}
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="border-none outline-none ring-0"
            required
          />
        </div>
        <div className="mt-2 mb-2 text-center text-green-500">
          <button className="text-sm " type="reset">
            Forget password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity"
        >
          {state !== "login" ? "Sign Up" : "Login"}
        </button>
        <p className="text-gray-600 text-sm mt-3 mb-11">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account? "}
          <a
            onClick={() => {
              if (state === "login") {
                setSearchParams({ state: "register" });
              } else {
                setSearchParams({ state: "login" });
              }
            }}
            className="text-green-500 hover:underline"
          >
            {" "}
            click here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
