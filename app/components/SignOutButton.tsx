"use client";
import { ButtonHTMLAttributes, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

import { Button } from "@/app/components";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton = ({ ...props }: SignOutButtonProps) => {
   const [isSigninOut, setIsSigninOut] = useState(false);

   return (
      <Button
         variant="ghost"
         {...props}
         onClick={async () => {
            setIsSigninOut(true);
            try {
               await signOut();
            } catch (err) {
               toast.error("There was a problem signing out");
               console.error(err);
            } finally {
               setIsSigninOut(false);
            }
         }}
      >
         {isSigninOut ? (
            <Loader2 className="animate-spin h-4 w-4" />
         ) : (
            <LogOut className="w-4 h-4" />
         )}
      </Button>
   );
};

export default SignOutButton;
