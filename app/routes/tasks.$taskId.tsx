import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import type { TaskRecord } from "../data";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getTask, updateTask } from "../data";
import { Box, Button, Checkbox, Flex, Heading, Text } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

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
    <Box id="task" p={5} width="50%">
      <Heading width="100%">
        <Flex
          align="center"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center">
            <CheckDone task={task} />
            <Text ml={2} display="inline">
              {task.name ? task.name : <i>No text</i>}
            </Text>
          </Box>
          <Box display="flex">
            <Form action="edit">
              <Button
                type="submit"
                leftIcon={<EditIcon />}
                variant="unstyled"
                color="blue.500"
                fontSize="md"
                display="flex"
                alignItems="center"
                _hover={{
                  textDecoration: "underline", // ホバー時に下線を表示
                  boxShadow: "none", // ホバー時にもシャドウを削除
                }}
                boxShadow="none" // シャドウを削除
              >
                編集
              </Button>
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
              <Button
                type="submit"
                leftIcon={<EditIcon />}
                variant="unstyled"
                color="blue.500"
                fontSize="md"
                display="flex"
                alignItems="center"
                ml={4}
                _hover={{
                  textDecoration: "underline", // ホバー時に下線を表示
                  boxShadow: "none", // ホバー時にもシャドウを削除
                }}
                boxShadow="none" // シャドウを削除
              >
                削除
              </Button>
            </Form>
          </Box>
        </Flex>
      </Heading>
      <Box id="task" p={5} width="100%">
        {task.notes ? (
          <Text fontFamily="monospace" whiteSpace="pre-wrap">
            {task.notes}
          </Text>
        ) : null}
      </Box>
      <div></div>
    </Box>
  );
}

const CheckDone: FunctionComponent<{
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
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          width: "20px",
          height: "20px",
        }}
      >
        <Checkbox isChecked={done} isReadOnly size="lg" />
      </button>
    </fetcher.Form>
  );
};
