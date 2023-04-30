import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const config = {
   matcher: ["/", "/login", "/dashboard/:path*"],
};

export default withAuth(
   async function middleware(req: NextRequestWithAuth) {
      const pathname = req.nextUrl.pathname;

      // manage
      const isAuth = await getToken({ req });
      const isLoginPage = pathname.startsWith("/login");

      const sensitiveRoutes = ["/dashboard"];
      const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
         pathname.startsWith(route)
      );

      if (isLoginPage) {
         if (isAuth) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
         }
         return NextResponse.next();
      }

      if (!isAuth && isAccessingSensitiveRoute) {
         return NextResponse.redirect(new URL("/login", req.url));
      }
      if (pathname === "/") {
         return NextResponse.redirect(new URL("/dashboard", req.url));
      }
   },
   {
      callbacks: {
         async authorized() {
            return true;
         },
      },
   }
);
