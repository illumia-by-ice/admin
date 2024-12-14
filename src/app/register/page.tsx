"use client";

import { Google } from "iconsax-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const Page = () => {
  const schema = yup.object({
    firstName: yup
      .string()
      .min(3, "First Name must contain at least 3 characters")
      .required("Required"),
    lastName: yup
      .string()
      .min(3, "Last Name must contain at least 3 characters")
      .required("Required"),
    email: yup.string().email("Invalid Email").required("Required"),
    password: yup
      .string()
      .trim("Password cannot contain whitespaces")
      .min(6, "Password must contain atleast 6 characters")
      .required("Required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterFormInput>({
    resolver: yupResolver(schema),
    mode: "all"
  });

  const onSubmit: SubmitHandler<IRegisterFormInput> = (data) => {
    console.log(data);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
        <img src="/images/img-auth-login.png" alt="" />
        <h1 className="text-center text-xl font-semibold">Register</h1>
        <p className="mt-3">
          Already have an account?{" "}
          <a href="/login">
            <span className="text-green-600">Log In</span>
          </a>
        </p>
        <div className="w-full">
          <form
            className="mt-8 flex flex-col items-center w-full gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col w-[90%]">
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                {...register("firstName")}
              />
              <p className="text-sm text-red-500">
                {errors.firstName?.message}
              </p>
            </div>
            <div className="flex flex-col w-[90%]">
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                {...register("lastName")}
              />
              <p className="text-sm text-red-500">{errors.lastName?.message}</p>
            </div>
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
            <div className="flex flex-col w-[90%]">
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
              {...register("password")}
            />
            <p className="text-sm text-red-500">{errors.password?.message}</p>
            </div>

            <button
              type="submit"
              className="w-[90%] p-3 text-white bg-green-600 rounded-lg"
            >
              Register
            </button>
          </form>
          <a
            href="https://6z3n7bx4-7000.euw.devtunnels.ms/api/auth/google"
            className="flex justify-center"
          >
            <button className="mt-3 w-[90%] p-3 text-green-600 bg-white rounded-lg flex items-center justify-center gap-3 border-2 border-green-600">
              <Google size="26" color="#16a34a" />
              <span>Continue with Google</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
