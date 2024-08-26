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
import { getContacts, createEmptyContact } from "./data";
import { withEmotionCache } from "@emotion/react";
import {
  ChakraProvider,
  extendTheme,
  Alert,
  AlertIcon,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FaInfoCircle } from "react-icons/fa";
import { keyframes } from "@emotion/react";

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

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
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
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
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
              <h1>Remix Contacts</h1>
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
                    aria-label="Search contacts"
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
                {contacts.length ? (
                  <ul>
                    {contacts.map((contact) => (
                      <li key={contact.id}>
                        <NavLink
                          className={({ isActive, isPending }) =>
                            isActive ? "active" : isPending ? "pending" : ""
                          }
                          to={`contacts/${contact.id}`}
                        >
                          <Link to={`contacts/${contact.id}`}>
                            {contact.first || contact.last ? (
                              <>
                                {contact.first} {contact.last}
                              </>
                            ) : (
                              <i>No Name</i>
                            )}{" "}
                            {contact.favorite ? <span>★</span> : null}
                          </Link>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No contacts</i>
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
              <Box my={4}>
                <Alert
                  status="success"
                  mt={4}
                  animation={`${bounce} 1s infinite`}
                >
                  <AlertIcon />
                  Hello, Chakra UI!!
                </Alert>
                <Alert status="info" mt={4}>
                  <Icon as={FaInfoCircle} boxSize={6} mr={2} />
                  This is an informational message ( ˙ㅂ˙)b
                </Alert>
              </Box>
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
