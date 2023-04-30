import { fetchRedis } from "./redis";

export const getFriendsById = async (userId: string): Promise<User[]> => {
   const friendsIds = (await fetchRedis(
      "smembers",
      `user:${userId}:friends`
   )) as string[];

   const friends = await Promise.all(
      friendsIds.map(async (x) => {
         const friend = (await fetchRedis("get", `user:${userId}`)) as string;

         return JSON.parse(friend) as User;
      })
   );

   return friends;
};
