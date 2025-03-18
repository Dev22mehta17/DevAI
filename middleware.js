import { clerkMiddleware } from "@clerk/nextjs/server";

console.log("Clerk Middleware is running...");

export default clerkMiddleware();

export const config = {
    matcher: ["/((?!.*\\..*).*)", "/api/:path*"],
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
