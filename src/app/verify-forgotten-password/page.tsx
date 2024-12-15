"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

const Page = () => {
  const [loading, setLoading] = useState(false);

  const schema = yup.object({
    email: yup.string().email("Invalid Email").required("Required"),
    newPassword: yup
      .string()
      .trim("Password cannot contain whitespaces")
      .min(6, "Password must contain at least 6 characters")
      .required("Required"),
    otp: yup
      .string()
      .trim("OTP cannot contain whitespaces")
      .required("Required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IVerifyPasswordFormInput>({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<IVerifyPasswordFormInput> = (data) => {
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
          Verify Password Reset
        </h1>
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
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>
            <div className="flex flex-col w-[90%]">
              <input
                type="password"
                id="newPassword"
                placeholder="New Password"
                className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                {...register("newPassword")}
              />
              <p className="text-red-500 text-sm">
                {errors.newPassword?.message}
              </p>
            </div>
            <div className="flex flex-col w-[90%]">
              <input
                type="text"
                id="otp"
                placeholder="Input OTP"
                className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                {...register("otp")}
              />
              <p className="text-red-500 text-sm">{errors.otp?.message}</p>
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
