import { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

// app/routes/auth/google/callback.tsx
export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
