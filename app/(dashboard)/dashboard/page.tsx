import React from "react";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

const Dashboard = async () => {
   const session = await getServerSession(authOptions);

   return (
      <div>
         <pre>{JSON.stringify(session)}</pre>
      </div>
   );
};

export default Dashboard;
