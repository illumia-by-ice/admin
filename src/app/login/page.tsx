"use client";

import { Google } from "iconsax-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa6" 

const Page = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [firstLoader, setFirstLoader] = useState(true);

  //@ts-ignore
  const setToken = useAuthStore((state) => state.updateToken);
  //@ts-ignore
  const token = useAuthStore((state) => state.token);

  const schema = yup.object({
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
  } = useForm<ILoginFormInput>({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<ILoginFormInput> = async (data) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (res.status === 201) {
        setToken(res.data.accessToken);
        toast.success(res.data.message);
        router.push("/dashboard");
      }
    } catch (err) {
      const error = err as AxiosError;

      //@ts-ignore
      toast.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    } else {
      setFirstLoader(false);
    }
  }, []);

  return (
    <>
      {firstLoader ? (
        <div className="w-full h-screen flex justify-center items-center">
            <FaSpinner size={52} className="animate-spin"/>
        </div>
      ) : (
        <div className="w-full h-screen flex justify-center items-center">
          <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
            <img src="/images/img-auth-login.png" alt="" />
            <h1 className="text-center text-xl font-semibold">
              Login with your email
            </h1>
            <p className="mt-3">
              Don't have an account?{" "}
              <a href="/register">
                <span className="text-green-600">Register</span>
              </a>
            </p>
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
                  <p className="text-sm text-red-500">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-[90%]">
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className="p-3 border-2 w-full outline-none rounded-lg border-black/40"
                    {...register("password")}
                  />
                  <p className="text-sm text-red-500">
                    {errors.password?.message}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-[90%] p-3 text-white bg-green-600 rounded-lg"
                >
                  {loading ? "Submitting...." : "Login"}
                </button>
              </form>
              <a href="/forgotten-password">
                <p className="text-sm text-gray-500 text-right mt-3">
                  Forgotten Password?
                </p>
              </a>
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
      )}
    </>
  );
};

export default Page;
