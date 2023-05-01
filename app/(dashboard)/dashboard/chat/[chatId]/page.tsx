// "use client";
import React from "react";
import { getServerSession } from "next-auth";
import { toast } from "react-hot-toast";

import { authOptions } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { fetchRedis } from "@/app/helper/redis";
import { messageArrayValidator } from "@/app/lib/validations/message";
import { z } from "zod";
import Image from "next/image";
import { ChatInput, Messages } from "@/app/components";

interface PropTypes {
   params: { chatId: string };
}

/**
 * @description This function extract your previous messages with the boy/girl
 * @param chatId chat id to parse your previous messages with the partner
 */
const getChatMessages = async (chatId: string) => {
   try {
      const results: string[] = await fetchRedis(
         "zrange",
         `chat:${chatId}:messages`,
         0,
         -1
      );
      const dbMessages = results.map(
         (message) => JSON.parse(message) as Message
      );
      const reversedDBMessages = dbMessages.reverse();
      const messages = messageArrayValidator.parse(reversedDBMessages);
      return messages;
   } catch (error) {
      notFound();
   }
};

const Chat = async ({ params }: PropTypes) => {
   const session = await getServerSession(authOptions);
   if (!session) notFound();

   const { chatId } = params;
   const { user } = session;
   const [userId1, userId2] = chatId.split("--");

   if (user.id !== userId1 && user.id !== userId2) {
      notFound();
   }

   const chatPartnerId = user.id === userId1 ? userId2 : userId1;
   const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
   const initialMessages = await getChatMessages(chatId);

   return (
      <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
         <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
            <div className="relative flex items-center space-x-4">
               <div className="relative">
                  <div className="relative w-8 sm:w-12 h-8 sm:h-12">
                     <Image
                        fill
                        referrerPolicy="no-referrer"
                        src={chatPartner.image}
                        alt={`${chatPartner.name} profile picture`}
                        className="rounded-full"
                     />
                  </div>
               </div>

               <div className="flex flex-col leading-tight">
                  <div className="text-xl flex items-center">
                     <span className="text-gray-700 mr-3 font-semibold">
                        {chatPartner.name}
                     </span>
                  </div>
                  <span className="text-sm text-gray-600">
                     {chatPartner.email}
                  </span>
               </div>
            </div>
         </div>

         <Messages
            initialMessages={initialMessages}
            sessionId={session.user.id}
            chatPartner={chatPartner}
            sessionImg={session.user.image || ""}
         />
         <ChatInput chatPartner={chatPartner} chatId={chatId} />
      </div>
   );
};

export default Chat;
