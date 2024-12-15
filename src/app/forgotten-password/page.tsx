"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

const Page = () => {
  const [loading, setLoading] = useState(false);

  const schema = yup.object({
    email: yup.string().email("Invalid Email").required("Required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordFormInput>({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<IForgotPasswordFormInput> = (data) => {
    setLoading(true);

    try {
    } catch (err) {
    } finally {
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
        <img src="/images/img-auth-login.png" alt="" />
        <h1 className="text-center text-xl font-semibold">
          Forgotten Password
        </h1>
        <p className="mt-3">Enter your email to reset your password</p>
        <div className="w-full">
          <form
            className="mt-8 flex flex-col items-center w-full gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col w-[90%]">
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                {...register("email")}
              />
              <p className="text-sm text-red-500">{errors.email?.message}</p>
            </div>
            <button
              type="submit"
              className="w-[90%] p-3 text-white bg-green-600 rounded-lg"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
