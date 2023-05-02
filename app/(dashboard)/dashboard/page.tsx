import React from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { authOptions } from "@/app/lib/auth";
import { getFriendsById } from "@/app/helper/friends-by-id";
import { fetchRedis } from "@/app/helper/redis";
import { chatHrefConstrictor } from "@/app/lib/utils";
import Image from "next/image";

const Dashboard = async () => {
   const session = await getServerSession(authOptions);
   if (!session) notFound();

   const friends = await getFriendsById(session.user.id);

   const friendsWithLastMessage = await Promise.all(
      friends.map(async (friend) => {
         const [RawMessage] = (await fetchRedis(
            "zrange",
            `chat:${chatHrefConstrictor(session.user.id, friend.id)}:messages`,
            -1,
            -1
         )) as string[];
         const lastMessage = JSON.parse(RawMessage) as Message;

         return { ...friend, lastMessage };
      })
   );

   return (
      <div className="py-12 pl-8">
         <h2 className="font-bold text-5xl mb-8">Recent Chats</h2>
         {friendsWithLastMessage.length === 0 ? (
            <p className="text-sm text-zinc-500">No last Chat</p>
         ) : (
            friendsWithLastMessage.map((friend) => (
               <div
                  key={friend.id}
                  className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
               >
                  <div className="absolute right-4 inset-y-0 flex items-center">
                     <ChevronRight className="h-7 w-7 text-zinc-400" />
                  </div>

                  <Link
                     href={`/dashboard/chat/${chatHrefConstrictor(
                        session.user.id,
                        friend.id
                     )}`}
                     className="relative sm:flex"
                  >
                     <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                        <div className="relative h-6 w-6">
                           <Image
                              referrerPolicy="no-referrer"
                              className="rounded-md"
                              src={friend.image}
                              fill
                              alt="Profile Image"
                           />
                        </div>
                     </div>

                     <div>
                        <h2 className="text-lg font-semibold">{friend.name}</h2>
                        <p className="mt-1 max-w-md">
                           <span className="text-zinc-400">
                              {friend.lastMessage.senderId === session.user.id
                                 ? "You: "
                                 : "He: "}
                           </span>
                           {friend.lastMessage.text}
                        </p>
                     </div>
                  </Link>
               </div>
            ))
         )}
      </div>
   );
};

export default Dashboard;
