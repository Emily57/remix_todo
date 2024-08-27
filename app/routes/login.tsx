import { Link } from "@remix-run/react";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Link to="/auth_google">Login with Google</Link>
    </div>
  );
}
