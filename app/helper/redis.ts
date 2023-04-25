const redis_api_url = process.env.UPSTASH_REDIS_REST_URL as string;
const redis_token = process.env.UPSTASH_REDIS_REST_TOKEN as string;

type Commands = "zrange" | "sismember" | "get" | "smember";

export async function fetchRedis(
   command: Commands,
   ...args: (string | number)[]
) {
   const commandUrl = `${redis_api_url}/${command}/${args.join("/")}`;
   const response = await fetch(commandUrl, {
      headers: {
         Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      cache: "no-store",
   });

   if (!response.ok) {
      throw new Error(`Error executing Redis command: ${response.statusText}`);
   }

   const data = await response.json();
   return data.result;
}
