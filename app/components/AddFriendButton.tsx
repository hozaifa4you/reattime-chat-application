"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/app/components";
import { addFriendValidate } from "@/app/lib/validations/add-friend";

type FormData = z.infer<typeof addFriendValidate>;

const AddFriendButton = () => {
   const [showSuccessSate, setShowSuccessSate] = useState<boolean>(false);

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors },
   } = useForm<FormData>({
      resolver: zodResolver(addFriendValidate),
   });

   const addFriend = async (email: string) => {
      try {
         const validateEmail = addFriendValidate.parse({ email });

         await axios.post("/api/friends/add", { email: validateEmail });

         setShowSuccessSate(true);
      } catch (err) {
         if (err instanceof z.ZodError) {
            setError("email", { message: err.message });
            toast.error(err.message);
            return; // FIXME fix in future
         }
         if (err instanceof AxiosError) {
            setError("email", { message: err.response?.data });
            toast.error(err.response?.data);
            return; // FIXME fix in future
         }

         setError("email", { message: "Something went wrong" });
         toast.error("Something went wrong!");
      }
   };

   const onSubmit = (data: FormData) => {
      addFriend(data.email);
   };

   return (
      <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
         <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-500"
         >
            Add friend by Email
         </label>
         <div className="mt-2 flex gap-4">
            <input
               {...register("email")}
               type="text"
               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
               placeholder="you@example.com"
            />
            <Button>Add</Button>
         </div>
         <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
         {showSuccessSate ? (
            <p className="mt-1 text-sm text-green-600">Friend request sent!</p>
         ) : null}
      </form>
   );
};

export default AddFriendButton;
