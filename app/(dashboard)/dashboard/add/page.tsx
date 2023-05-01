import React from "react";

import { AddFriendButton } from "@/app/components";

const Add = async () => {
   // await new Promise((resolve) => setTimeout(resolve, 5000));

   return (
      <main className="pt-8 pl-8">
         <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
         <AddFriendButton />
      </main>
   );
};

export default Add;
