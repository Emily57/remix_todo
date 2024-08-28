import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getTask, updateTask } from "../data";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateTask(params.taskId, updates);
  return redirect(`/tasks/${params.taskId}`);
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const task = await getTask(params.taskId);
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ task });
};

export default function EditTask() {
  const { task } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form key={task.id} id="task-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={task.name}
          aria-label="name"
          name="name"
          type="text"
          placeholder="name"
        />
      </p>
      <label>
        <span>Notes</span>
        <textarea defaultValue={task.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
      </p>
    </Form>
  );
}
