import React from "react";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

const Dashboard = async () => {
   const session = await getServerSession(authOptions);

   return <div>Dashboard</div>;
};

export default Dashboard;
