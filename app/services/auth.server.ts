import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "app/services/session.server";

export const authenticator = new Authenticator(sessionStorage);

const googleStrategy = new GoogleStrategy(
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clientID: process.env.GOOGLE_CLIENT_ID!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    prompt: "select_account",
  },
  async ({ profile }) => {
    // ユーザー情報をデータベースに保存するなどの処理を行います
    return profile;
  }
);

authenticator.use(googleStrategy);
