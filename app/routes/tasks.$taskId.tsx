import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import type { TaskRecord } from "../data";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getTask, updateTask } from "../data";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const formData = await request.formData();
  return updateTask(params.taskId, {
    done: formData.get("done") === "true",
  });
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const task = await getTask(params.taskId);
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ task });
};

export default function Task() {
  const { task } = useLoaderData<typeof loader>();

  return (
    <div id="task">
      <div>
        <h1>
          {task.name ? <>{task.name}</> : <i>No text</i>}
          <Favorite task={task} />
        </h1>
        {task.notes ? <p>{task.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  task: Pick<TaskRecord, "done">;
}> = ({ task }) => {
  const fetcher = useFetcher();
  const done = fetcher.formData
    ? fetcher.formData.get("done") === "true"
    : task.done;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={done ? "Remove from dones" : "Add to dones"}
        name="done"
        value={done ? "false" : "true"}
      >
        {done ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
