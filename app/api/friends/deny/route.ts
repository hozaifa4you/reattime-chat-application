import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";
import { log } from "console";

import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
   try {
      const body = await req.json();
      const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

      const session = await getServerSession(authOptions);
      if (!session) return new Response("unauthorized", { status: 401 });

      await db.srem(
         `user:${session.user.id}:incoming_friend_requests`,
         idToDeny
      );

      return new Response("ok");
   } catch (error) {
      log(error);
      if (error instanceof z.ZodError) {
         return new Response("invalid request payload", { status: 422 });
      }

      return new Response("Invalid request", { status: 400 });
   }
}
