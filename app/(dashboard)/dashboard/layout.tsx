import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { authOptions } from "@/app/lib/auth";
import { Icon, Icons } from "@/app/components/Icons";
import {
   FriendRequestSidebarOption,
   SidebarChatList,
   SignOutButton,
} from "@/app/components";
import { fetchRedis } from "@/app/helper/redis";
import { getFriendsById } from "@/app/helper/friends-by-id";

interface LayoutProps {
   children: ReactNode;
}

interface SidebarOptions {
   id: number;
   name: string;
   href: string;
   Icon: Icon;
}

const sidebarOptions: SidebarOptions[] = [
   { id: 1, name: "Add Friend", href: "/dashboard/add", Icon: "UserPlus" },
];

const DashboardLayout = async ({ children }: LayoutProps) => {
   const session = await getServerSession(authOptions);
   if (!session) notFound();

   const friends = await getFriendsById(session.user.id);

   // FIXME There is some realtime change
   const unseenRequestCount = (
      (await fetchRedis(
         "smembers",
         `user:${session.user.id}:incoming_friend_requests`
      )) as User[]
   ).length;

   return (
      <div className="w-full flex h-screen pl-3">
         <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
               <Icons.Logo className="h-8 w-auto text-indigo-600" />
            </Link>

            <div className="text-xs font-semibold leading-6 text-gray-400">
               Your chat
            </div>

            <nav className="flex flex-1 flex-col">
               <ul className="flex flex-1 flex-col gap-y-7" role="list">
                  {/* TODO chat that you have */}
                  <li>
                     {friends.length ? (
                        <SidebarChatList
                           friends={friends}
                           sessionId={session.user.id}
                        />
                     ) : (
                        <p className="text-rose-600">No Friends</p>
                     )}
                  </li>
                  {/* TODO: List your navigation */}
                  <li>
                     <div className="text-xs font-semibold leading-6 text-gray-400">
                        Overview
                     </div>

                     <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {sidebarOptions.map((option) => {
                           const Icon = Icons[option.Icon];

                           return (
                              <li key={option.id}>
                                 <Link
                                    href={option.href}
                                    className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                 >
                                    <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                                       <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="truncate">
                                       {option.name}
                                    </span>
                                 </Link>
                              </li>
                           );
                        })}
                        {/* TODO upcoming friend request */}
                        <li>
                           <FriendRequestSidebarOption
                              sessionId={session.user.id}
                              initialUnseenRequestCount={unseenRequestCount}
                           />
                        </li>
                     </ul>
                  </li>

                  {/* TODO user information */}
                  <li className="-mx-6 mt-auto flex items-center">
                     <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                        <div className="relative h-8 w-8 bg-gray-50">
                           <Image
                              fill
                              referrerPolicy="no-referrer"
                              className="rounded-full"
                              src={session.user.image || ""}
                              alt="Your profile image"
                           />
                        </div>

                        <span className="sr-only">Your Profile</span>
                        <div className="flex flex-col">
                           <span aria-hidden="true">{session.user.name}</span>
                           <span
                              className="text-xs text-zinc-400"
                              aria-hidden="true"
                           >
                              {session.user.email}
                           </span>
                        </div>
                     </div>
                     <SignOutButton />
                  </li>
               </ul>
            </nav>
         </div>
         {children}
      </div>
   );
};

export default DashboardLayout;
