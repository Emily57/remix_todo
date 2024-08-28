import React from "react";
import { Link, NavLink, Form } from "react-router-dom";

interface SidebarProps {
  q: string | null;
  searching: boolean;
  tasks: { id: string; name: string; done: boolean }[];
  submit: (target: HTMLFormElement, options: { replace: boolean }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ q, searching, tasks, submit }) => {
  return (
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
  );
};

export default Sidebar;
