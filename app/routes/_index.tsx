import { Form, Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

interface LoaderData {
  isLoggedIn: boolean;
  userName?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await authenticator.authenticate("google", request);
    const userName = `${result.name.familyName} ${result.name.givenName}`;
    return json({ isLoggedIn: !!result, userName });
  } catch (error) {
    return json({ isLoggedIn: false });
  }
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>Remix todo</h1>
      <Link to="/auth_google">Login with Google</Link>
      {data.isLoggedIn && (
        <div>
          <p>Logged in as: {data.userName}</p>
          <Form method="post" action="/logout">
            <button type="submit">Logout</button>
          </Form>
        </div>
      )}
    </div>
  );
}
