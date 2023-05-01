import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/lib/auth";
import { addFriendValidate } from "@/app/lib/validations/add-friend";
import { fetchRedis } from "@/app/helper/redis";
import { db } from "@/app/lib/db";
import { pusherServer } from "@/app/lib/pusher";
import { toPusherKey } from "@/app/lib/utils";

export async function POST(req: Request) {
   try {
      const body = await req.json();

      const { email: emailToAdd } = addFriendValidate.parse(body.email);

      const idToAdd = (await fetchRedis(
         `get`,
         `user:email:${emailToAdd}`
      )) as string;
      if (!idToAdd)
         return new Response("This person does not exist.", { status: 400 });

      const session = await getServerSession(authOptions);
      if (!session) return new Response("Unauthorized", { status: 401 });

      if (idToAdd === session.user.id)
         return new Response("You can't add your self as a friend.", {
            status: 400,
         });

      const isAlreadyAdded = (await fetchRedis(
         "sismember",
         `user:${idToAdd}:incoming_friend_requests`,
         session.user.id
      )) as 0 | 1;

      if (isAlreadyAdded) {
         return new Response("Already added this user", { status: 400 });
      }

      const isAlreadyFriends = (await fetchRedis(
         "sismember",
         `user:${idToAdd}:friends`,
         idToAdd
      )) as 0 | 1;

      if (isAlreadyFriends) {
         return new Response("Already friend to this user", { status: 400 });
      }

      // TODO websocket
      console.log("pusher server");
      await pusherServer.trigger(
         toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
         "incoming_friend_requests",
         { senderId: session.user.id, senderEmail: session.user.email }
      );
      // add to database
      db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

      return new Response("OK", { status: 201 });
   } catch (err: any) {
      if (err instanceof z.ZodError) {
         return new Response("Invalid request payload", { status: 422 });
      }

      return new Response("Invalid request", { status: 400 });
   }
}
