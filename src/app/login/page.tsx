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
import { FaSpinner } from "react-icons/fa6";
import { useUserStore } from "@/state/user.store";

const Page = () => {
  const router = useRouter();
  //@ts-ignore
  const setToken = useAuthStore((state) => state.updateToken);
  //@ts-ignore
  const token = useAuthStore((state) => state.token);
  const setUser = useUserStore((state) => state.setUser)

  const [loading, setLoading] = useState(false);
  const [firstLoader, setFirstLoader] = useState(true);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    } else {
      setFirstLoader(false);
    }
  }, [token, router]);

  const schema = yup.object({
    email: yup.string().email("Invalid Email").required("Required"),
    password: yup
      .string()
      .trim()
      .min(6, "Password must contain at least 6 characters")
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
      const res = await api.post("/admin/login", data);

      if (res.status === 201) {
        setToken(res.data.accessToken);
        toast.success(res.data.message);
        setUser(res.data.data)
        router.push("/dashboard");
      }
    } catch (err) {
      //@ts-ignore
      const errorMessage = (err as AxiosError)?.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {firstLoader ? (
        <div className="w-full h-screen flex justify-center items-center">
          <FaSpinner size={52} className="animate-spin" />
        </div>
      ) : (
        <div className="w-full h-screen flex justify-center items-center">
          <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[35%] shadow-lg rounded-lg p-10 flex flex-col items-center">
            <img src="/images/img-auth-login.png" alt="Login" />
            <h1 className="text-center text-xl font-semibold">Login with your email</h1>
            <p className="mt-3">
              Don't have an account?{" "}
              <a href="/register">
                <span className="text-green-600">Register</span>
              </a>
            </p>
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
                className="w-[90%] p-3 text-white bg-green-600 rounded-lg flex justify-center items-center gap-2"
              >
                {loading ? <FaSpinner size={20} className="animate-spin" /> : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
