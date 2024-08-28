import { Form, Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <h1>Remix todo</h1>
      <Link to="/auth_google">Login with Google</Link>
      <Form method="post" action="/logout">
        <button type="submit">Logout</button>
      </Form>
    </div>
  );
}
