import { Google } from "iconsax-react";
import React from "react";

const Page = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
        <img src="/images/img-auth-login.png" alt="" />
        <h1 className="text-center text-xl font-semibold">Forgotten Password</h1>
        <p className="mt-3">Enter your email to reset your password</p>
        <div className="w-full">
          <form className="mt-8 flex flex-col items-center w-full gap-3">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              className="p-3 border-2 w-[90%] outline-none rounded-lg border-black/40"
            />            
            <button type="submit" className="w-[90%] p-3 text-white bg-green-600 rounded-lg">Continue</button>
          </form>
          </div>
      </div>
    </div>
  );
};

export default Page;
