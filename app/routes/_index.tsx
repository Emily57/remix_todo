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
    const userName = `${result.name.givenName} ${result.name.familyName}`;
    return json({ isLoggedIn: !!result, userName });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ isLoggedIn: false });
  }
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        width: "100%",
      }}
    >
      <h1>Remix todo</h1>
      <div>
        {data.isLoggedIn ? (
          <>
            <span>Logged in as: {data.userName}</span>
            <Form
              method="post"
              action="/logout"
              style={{ display: "inline", marginLeft: "1rem" }}
            >
              <button type="submit">Logout</button>
            </Form>
          </>
        ) : (
          <Link to="/auth_google">Login with Google</Link>
        )}
      </div>
    </div>
  );
}
