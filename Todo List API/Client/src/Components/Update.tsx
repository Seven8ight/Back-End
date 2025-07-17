import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { type Todos } from "./Layout";

const Update = (): React.ReactNode => {
  const { id } = useParams(),
    navigation = useNavigate(),
    [accessToken, setAToken] = useState<string>(),
    [title, setTitle] = useState<string>(),
    [description, setDescription] = useState<string>(),
    [responseMsg, setResponseMsg] = useState<string>(""),
    [error, setError] = useState<boolean>(false),
    [errorMsg, setMsg] = useState<string>(""),
    [todoItem, setItem] = useState<Todos>();

  const updateTaskHandler = async (
      event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
      event.preventDefault();

      try {
        let updateTaskRequest: Response = await fetch(
            "http://localhost:3000/todos/update",
            {
              method: "PUT",
              headers: {
                "Content-type": "application/json",
                Authorization: `${accessToken}`,
              },
              body: JSON.stringify({
                id,
                title,
                description,
              }),
            }
          ),
          updateTaskResponse = await updateTaskRequest.json();

        if (!updateTaskRequest.ok) {
          setError(true);
          setMsg(updateTaskResponse.message);
          return;
        }

        setResponseMsg(updateTaskResponse.message);
      } catch (error) {
        setError(true);
        setMsg((error as Error).message);
      }
    },
    fetchTask = async () => {
      try {
        let todoItemRequest = await fetch("http://localhost:3000/todos/get", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: `${accessToken}`,
            },
            body: JSON.stringify({
              id: id,
            }),
          }),
          todoItemResponse = await todoItemRequest.json();

        if (!todoItemRequest.ok) {
          setError(true);
          setMsg(todoItemResponse.message);
          return;
        }

        if (todoItemResponse.message.id)
          setItem({
            title: todoItemResponse.message.title,
            description: todoItemResponse.message.description,
            id: todoItemResponse.message.id,
            userId: todoItemResponse.message.userId,
          });
      } catch (error) {
        setError(true);
        setMsg((error as Error).message);
      }
    };

  useEffect(() => {
    let aToken = window.localStorage.getItem("accessToken");

    if (aToken) setAToken(aToken);
  }, []);

  useEffect(() => {
    (async () => await fetchTask())();
  }, []);

  useEffect(() => {
    let errorTimeout = setTimeout(async () => {
      if (error) setError(false);
      if (responseMsg.length > 0) setResponseMsg("");

      (async () => {
        await fetchTask();
        setTitle("");
        setDescription("");
      })();
    }, 2000);

    return () => clearTimeout(errorTimeout);
  }, [error, responseMsg]);

  return (
    <div id="Update">
      <div id="navigate">
        <button onClick={() => navigation("/")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Update Task</h1>
      </div>
      <div id="form">
        {todoItem && (
          <form onSubmit={(event) => updateTaskHandler(event)}>
            <label>Title</label>
            <br />
            <input
              type="text"
              placeholder={todoItem.title}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <br />
            <label>Description</label>
            <br />
            <input
              type="text"
              placeholder={todoItem.description}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <br />
            <button type="submit">Update</button>
          </form>
        )}
      </div>
      <div id="responses">
        {error && (
          <div id="error">
            <p>{errorMsg}</p>
          </div>
        )}
        {responseMsg.length > 0 && (
          <div id="success">
            <p>{responseMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Update;
