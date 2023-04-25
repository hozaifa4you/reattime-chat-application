import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/lib/auth";
import { addFriendValidate } from "@/app/lib/validations/add-friend";
import { fetchRedis } from "@/app/helper/redis";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
   try {
      const body = await req.json();

      const { email: emailToAdd } = addFriendValidate.parse(body.email);

      const id = await fetchRedis(`get`, `user:email:${emailToAdd}` as string);
      if (!id)
         return new Response("This person does not exist.", { status: 400 });

      const session = await getServerSession(authOptions);
      if (!session) return new Response("Unauthorized", { status: 401 });

      if (id === session.user.id)
         return new Response("You can't add your self as a friend.", {
            status: 400,
         });

      const isAlreadyAdded = (await fetchRedis(
         "sismember",
         `user:${id}:incoming_friend_requests`,
         session.user.id
      )) as 0 | 1;

      if (isAlreadyAdded) {
         return new Response("Already added this user", { status: 400 });
      }

      const isAlreadyFriends = (await fetchRedis(
         "sismember",
         `user:${id}:friends`,
         id
      )) as 0 | 1;

      if (isAlreadyFriends) {
         return new Response("Already friend to this user", { status: 400 });
      }

      //
      db.sadd(`user:${id}:incoming_friend_requests`, session.user.id);

      return new Response("OK", { status: 201 });
   } catch (err: any) {
      if (err instanceof z.ZodError) {
         return new Response("Invalid request payload", { status: 422 });
      }

      return new Response("Invalid request", { status: 400 });
   }
}
