import { Form, useActionData, redirect } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/node";
import { login } from "../utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const user = await login({
    email: email as string,
    password: password as string,
  });
  if (!user) {
    console.log("Invalid credentials");
    return json({ error: "Invalid credentials" }, { status: 400 });
  }

  console.log("login", user);
  return redirect("/");
};

type ActionData = {
  error?: string;
};

export default function Login() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <h1>Login</h1>
      <Form method="post">
        <div>
          <label>
            Email: <input type="email" name="email" />
          </label>
        </div>
        <div>
          <label>
            Password: <input type="password" name="password" />
          </label>
        </div>
        {actionData?.error && (
          <p style={{ color: "red" }}>{actionData.error}</p>
        )}
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
