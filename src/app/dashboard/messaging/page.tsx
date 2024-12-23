"use client";

import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa6";
import * as yup from "yup";

const Page = () => {
  const [loading, setLoading] = useState(false);
  //@ts-expect-error error
  const token = useAuthStore((state) => state.token);

  const sendMessageSchema = yup.object().shape({
    to: yup.string().required("List of recipient email is required"),
    subject: yup.string().required("Subject is required"),
    message: yup.string().required("Message body is required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ISendMessageFormInput>({
    resolver: yupResolver(sendMessageSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<ISendMessageFormInput> = async (data) => {
    setLoading(true);
    const recipients = data.to.trim().split(",");

    try {
      const res = await api.post(
        "/admin/send-message",
        {
          to: recipients,
          subject: data.subject,
          message: data.message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if(res.status === 200){
        reset()
        toast.success("Message sent successfully");
      }
    } catch (err) {
    //   console.log(err as AxiosError);
      toast.error("Error Occured while sending Message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full">
      <div>
        <h1 className="text-2xl font-semibold">Send Message</h1>
      </div>
      <div className="mt-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Recipient Emails
            </label>
            <input
              type="text"
              id="to"
              {...register("to")}
              className="p-3 border rounded-lg w-full outline-none"
              placeholder="Enter email addresses, separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: user1@example.com, user2@example.com
            </p>
            <p className="text-sm text-red-500">{errors.to?.message}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Message Subject
            </label>
            <input
              type="text"
              id="subject"
              {...register("subject")}
              className="p-3 border rounded-lg w-full outline-none"
              placeholder="Enter message subject"
            />
            <p className="text-sm text-red-500">{errors.subject?.message}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              id="message"
              {...register("message")}
              className="p-3 border rounded-lg w-full outline-none"
              placeholder="Type your message here..."
            />
          </div>
          <p className="text-sm text-red-500">{errors.message?.message}</p>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 flex justify-center"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner size={26} className="animate-spin" />
            ) : (
              <>Send Message</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
