import React, { useContext, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import appStylesHref from "./app.css?url";
import { getTasks, createEmptyTask } from "./data";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ServerStyleContext, ClientStyleContext } from "./context";
import Sidebar from "./Sidebar";
import { authenticator } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8" },
    { title: "New Remix App" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    useEffect(() => {
      emotionCache.sheet.container = document.head;
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (emotionCache.sheet as any)._insertTag(tag);
      });
      clientStyleData?.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const tasks = await getTasks(q);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await authenticator.authenticate("google", request);
    const userName = `${result.name.givenName} ${result.name.familyName}`;
    const isLoggedIn = !!result;
    if (!isLoggedIn) {
      return redirect("/");
    }
    return json({ isLoggedIn, userName, tasks, q });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ isLoggedIn: false, tasks, q, userName: "" });
  }
};

export const action = async () => {
  const task = await createEmptyTask();
  return redirect(`/tasks/${task.id}/edit`);
};

export default function App() {
  const { isLoggedIn, userName, tasks, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    name: task.name || "", // undefinedの場合は空文字列に変換
    done: task.done ?? false, // undefinedの場合はfalseに変換
  }));

  return (
    <Document>
      <ChakraProvider>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <Meta />
            <Links />
          </head>
          <body>
            <Sidebar
              q={q}
              searching={searching || false}
              tasks={formattedTasks}
              submit={submit}
              isLoggedIn={isLoggedIn}
            />
            <div
              style={{
                width: "100%",
              }}
            >
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
                  {isLoggedIn ? (
                    <>
                      <span>Logged in as: {userName}</span>
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
              {isLoggedIn ? (
                <div
                  id="detail"
                  className={
                    navigation.state === "loading" && !searching
                      ? "loading"
                      : ""
                  }
                >
                  <Outlet />
                </div>
              ) : (
                <p>ログインしてください</p>
              )}
            </div>
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </ChakraProvider>
    </Document>
  );
}
