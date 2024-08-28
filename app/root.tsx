import React, { useContext, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
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
  return json({ tasks, q });
};

export const action = async () => {
  const task = await createEmptyTask();
  return redirect(`/tasks/${task.id}/edit`);
};

export default function App() {
  const { tasks, q } = useLoaderData<typeof loader>();
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
            <div id="sidebar">
              <div className="home">
                <Link to="/">
                  <h1>Remix Tasks</h1>
                </Link>
              </div>
              <div>
                <Form
                  id="search-form"
                  onChange={(event) => {
                    const isFirstSearch = q === null;
                    submit(event.currentTarget, {
                      replace: !isFirstSearch,
                    });
                  }}
                  role="search"
                >
                  <input
                    id="q"
                    aria-label="Search tasks"
                    className={searching ? "loading" : ""}
                    defaultValue={q || ""}
                    placeholder="Search"
                    type="search"
                    name="q"
                  />
                  <div id="search-spinner" aria-hidden hidden={!searching} />
                </Form>
                <Form method="post">
                  <button type="submit">New</button>
                </Form>
              </div>
              <nav>
                {tasks.length ? (
                  <ul>
                    {tasks.map((task) => (
                      <li key={task.id}>
                        <NavLink
                          className={({ isActive, isPending }) =>
                            isActive ? "active" : isPending ? "pending" : ""
                          }
                          to={`tasks/${task.id}`}
                        >
                          <Link to={`tasks/${task.id}`}>
                            {task.name ? <>{task.name}</> : <i>No Name</i>}{" "}
                            {task.done ? <span>★</span> : null}
                          </Link>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No tasks</i>
                  </p>
                )}
              </nav>
            </div>
            <div
              id="detail"
              className={
                navigation.state === "loading" && !searching ? "loading" : ""
              }
            >
              <Outlet />
            </div>
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </ChakraProvider>
    </Document>
  );
}
