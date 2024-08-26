type User = {
  id: number;
  email: string;
  password: string;
};

type LoginProps = {
  email: string;
  password: string;
};

const users: User[] = [
  { id: 1, email: "user@example.com", password: "password" },
  { id: 2, email: "user2@example.com", password: "test" },
];

export async function login({ email, password }: LoginProps) {
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (user) {
    return { id: user.id, email: user.email };
  }
  return null;
}
