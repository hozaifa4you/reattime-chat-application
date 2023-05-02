"use client";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

import { chatHrefConstrictor, toPusherKey } from "../lib/utils";
import { pusherClient } from "../lib/pusher";
import { UnseenChatToast } from "@/app/components";

interface PropTypes {
   friends: User[];
   sessionId: string;
}

interface ExtendedMessage extends Message {
   senderImg: string;
   senderName: string;
}

const SidebarChatList = ({ friends, sessionId }: PropTypes) => {
   const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      if (pathname?.includes("chat")) {
         setUnseenMessages((prev) =>
            prev.filter((msg) => !pathname.includes(msg.senderId))
         );
      }
   }, [pathname]);

   // TODO interact with ws
   useEffect(() => {
      pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

      const chatHandler = (message: ExtendedMessage) => {
         const shouldNotify =
            pathname !==
            `/dashboard/chat/${chatHrefConstrictor(
               sessionId,
               message.senderId
            )}`;

         if (!shouldNotify) return;
         // toast
         toast.custom((t) => (
            <UnseenChatToast
               t={t}
               sessionId={sessionId}
               senderId={message.senderId}
               senderImg={message.senderImg}
               senderMessage={message.text}
               senderName={message.senderName}
            />
         ));

         setUnseenMessages((prev) => [...prev, message]);
      };

      const newFriendHandler = () => {
         router.refresh();
      };

      pusherClient.bind("new_message", chatHandler);
      pusherClient.bind("new_friend", newFriendHandler);

      return () => {
         pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
         pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

         pusherClient.unbind("new_message", chatHandler);
         pusherClient.unbind("new_friend", newFriendHandler);
      };
   }, [sessionId, router, pathname]);

   return (
      <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
         {friends.sort().map((friend) => {
            const unseenMsgCount = unseenMessages.filter(
               (unseenMsg) => unseenMsg.senderId === friend.id
            ).length;

            return (
               <li key={friend.id}>
                  <a
                     href={`/dashboard/chat/${chatHrefConstrictor(
                        sessionId,
                        friend.id
                     )}`}
                     className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                     {friend.name}
                     {unseenMsgCount > 0 ? (
                        <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                           {unseenMsgCount}
                        </div>
                     ) : null}
                  </a>
               </li>
            );
         })}
      </ul>
   );
};

export default SidebarChatList;
