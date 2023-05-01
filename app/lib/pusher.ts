import PusherServer from "pusher";
import PusherClient from "pusher-js";

const pusher_app_id = process.env.PUSHER_APP_ID as string;
const pusher_key = process.env.PUSHER_KEY as string;
const pusher_secret = process.env.PUSHER_SECRET as string;
const pusher_cluster = process.env.PUSHER_CLUSTER as string;
const next_pusher_cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string;
const next_pusher_key = process.env.NEXT_PUBLIC_PUSHER_KEY as string;

export const pusherServer = new PusherServer({
   appId: pusher_app_id,
   key: next_pusher_key,
   secret: pusher_secret,
   cluster: pusher_cluster,
   useTLS: true,
});

export const pusherClient = new PusherClient(next_pusher_key, {
   cluster: next_pusher_cluster,
});
