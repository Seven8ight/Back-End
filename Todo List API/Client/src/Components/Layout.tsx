import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DLlist, type todoItem } from "./LinkedList/LList";

export type Todos = {
  id: string;
  userId: string;
  title: string;
  description: string;
};

const animations = {
  animate: {
    y: -5,
    boxShadow: "0px 0px 10px 0px rgba(225,225,225,0.8)",
  },
};

const Layout = (): React.ReactNode => {
  const navigation = useNavigate(),
    [accessToken, setToken] = useState<string | null>(null),
    [refreshToken, setRToken] = useState<string | null>(null),
    [error, setError] = useState<boolean>(false),
    [errorMsg, setErrorMsg] = useState<string>(""),
    [todoInput, setInput] = useState<{ title: string; description: string }>({
      title: "",
      description: "",
    }),
    [responseMsg, setMsg] = useState<string>(""),
    [todoItems, setItems] = useState<DLlist>(new DLlist());

  useEffect(() => {
    const accessT = localStorage.getItem("accessToken"),
      refreshT = localStorage.getItem("refreshToken");

    if (accessT) setToken(accessT);

    if (refreshT) setRToken(refreshT);

    (async () => fetchProfile())();
  }, []);

  useEffect(() => {
    (async () => {
      if (accessToken) {
        try {
          let todoRequest: Response = await fetch(
              `http://localhost:3000/todos/getall`,
              {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                  Authorization: `${accessToken}`,
                },
              }
            ),
            todoResponse: Todos[] | any = await todoRequest.json();

          if (!todoRequest.ok) {
            console.log(todoResponse);
            if (typeof todoResponse.message == "string") {
              if (todoResponse.message == "Token passed is invalid") {
                let refreshTokenRequest: Response = await fetch(
                    "http://localhost:3000/accounts/renew",
                    {
                      method: "PATCH",
                      headers: {
                        "Content-type": "application/json",
                      },
                      body: JSON.stringify({
                        refreshToken,
                      }),
                    }
                  ),
                  refreshTokenResponse = await refreshTokenRequest.json();

                if (!refreshTokenRequest.ok) {
                  setError(true);
                  setErrorMsg(String(refreshTokenRequest.status));
                  console.log(refreshTokenResponse);
                  return;
                }

                setToken(refreshTokenResponse.message);
                fetchTasks(accessToken);
              } else if (
                todoResponse.message == "Database error in reading data"
              ) {
                setError(true);
                setErrorMsg("Server error in responding, please try again");
              }
            } else {
              console.log(todoResponse.message);
            }
            return;
          }

          if (todoRequest.status == 200) {
            fetchTasks(accessToken);
          }
        } catch (error) {
          setError(true);
          setErrorMsg((error as Error).message);
        }
      }
    })();
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
  }, [accessToken]);

  const fetchTasks = async (accessToken: string) => {
      let todoRequest: Response = await fetch(
          `http://localhost:3000/todos/getall`,
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: `${accessToken}`,
            },
          }
        ),
        todoResponse: Todos[] | any = await todoRequest.json();

      if (todoResponse.length > 0) {
        const newList = new DLlist();

        todoResponse.forEach((todo: todoItem) => {
          newList.insert({ ...todo, status: "Incomplete" });
        });

        setItems(newList);
      }
    },
    fetchProfile = async () => {
      if (accessToken) {
        try {
          let userProfileRequest: Response = await fetch(
              "http://localhost:3000/accounts/profile",
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: `${accessToken}`,
                },
              }
            ),
            userProfileResponse = await userProfileRequest.json();

          if (!userProfileRequest.ok) console.log(userProfileResponse);
          else navigation(`/user/${userProfileResponse.message.id}`);
        } catch (error) {
          setError(true);
          setErrorMsg("User not found, please log in again, redirecting");
          setTimeout(() => {
            navigation("/auth");
          }, 2000);
        }
      }
    },
    handleAddTask = async () => {
      try {
        if (todoInput.title.length > 0 && todoInput.description.length > 0) {
          let addTaskRequest = await fetch("http://localhost:3000/todos/add", {
              method: "POST",
              headers: {
                "Content-type": "application/json",
                Authorization: `${accessToken}`,
              },
              body: JSON.stringify(todoInput),
            }),
            addTaskResponse = await addTaskRequest.json();

          if (!addTaskRequest.ok) {
            setError(true);
            setErrorMsg(addTaskResponse.message);
            return;
          }

          if (addTaskRequest.status == 201) {
            if (accessToken) fetchTasks(accessToken);
          } else {
            setError(true);
            setErrorMsg(addTaskResponse.message);
            return;
          }

          setInput({
            title: "",
            description: "",
          });
        } else setMsg("Incomplete fields, ensure all fields are having values");
      } catch (error) {
        setError(true);
        setErrorMsg((error as Error).message);
      }
    },
    updateTaskStatus = (taskId: string, status: "Complete" | "Incomplete") => {
      const newList = new DLlist();

      for (let item of todoItems.getItems()) {
        newList.insert(item);
      }

      newList.updateTodo({ id: taskId, status: status });
      setItems(newList);
    },
    deleteTask = async (taskId: string) => {
      try {
        const newList = new DLlist();

        for (let item of todoItems.getItems()) {
          newList.insert(item);
        }

        newList.removeAny(taskId);
        setItems(newList);

        let deleteRequest = await fetch(
          `http://localhost:3000/todos/delete/${taskId}`,
          {
            method: "DELETE",
            headers: {
              "Content-type": "application/json",
              Authorization: `${accessToken}`,
            },
          }
        );

        if (accessToken) {
          fetchTasks(accessToken);
        }
      } catch (error) {
        console.log(error);
        setError(true);
        setErrorMsg((error as Error).message);
      }
    };

  return (
    <div id="layout">
      <div id="header">
        <h1>To do</h1>
        <div id="settings">
          <motion.button
            variants={animations}
            transition={{
              duration: 0.5,
            }}
            whileHover="animate"
            onClick={() => fetchProfile()}
          >
            {accessToken ? (
              <i className="fa-solid fa-user"></i>
            ) : (
              <i className="fa-solid fa-user-plus"></i>
            )}
          </motion.button>
        </div>
      </div>
      <div id="addtask">
        <div id="inputs">
          <input
            type="text"
            placeholder="Title"
            required
            value={todoInput.title}
            onChange={(event) =>
              setInput((current) => {
                return { ...current, title: event.target.value };
              })
            }
          />
          <input
            type="text"
            required
            placeholder="description"
            value={todoInput.description}
            onChange={(event) =>
              setInput((current) => {
                return { ...current, description: event.target.value };
              })
            }
          />
        </div>
        <motion.button
          variants={animations}
          transition={{
            duration: 0.5,
          }}
          whileHover="animate"
          onClick={() => handleAddTask()}
        >
          <i className="fa-solid fa-plus"></i>
        </motion.button>
      </div>
      <div id="tasks">
        {todoItems.toArray().map((todo) => (
          <div id="todo" key={todo.id}>
            <div id="text">
              <h2
                style={{
                  textDecoration:
                    todo.status == "Complete" ? "line-through" : "none",
                }}
              >
                {todo.title}
              </h2>
              <p
                style={{
                  textDecoration:
                    todo.status == "Complete" ? "line-through" : "none",
                }}
              >
                {todo.description}
              </p>
            </div>
            <div id="status">
              <button onClick={() => navigation(`/update/${todo.id}`)}>
                <i className="fa-solid fa-ellipsis"></i>
              </button>
              <button
                onClick={() =>
                  updateTaskStatus(
                    todo.id,
                    todo.status == "Complete" ? "Incomplete" : "Complete"
                  )
                }
              >
                {todo.status == "Complete" ? (
                  <i
                    className="fa-solid fa-check"
                    style={{ color: "green" }}
                  ></i>
                ) : (
                  <i className="fa-solid fa-x" style={{ color: "red" }}></i>
                )}
              </button>
              <button onClick={() => deleteTask(todo.id)}>
                <motion.i
                  className="fa-solid fa-trash-can"
                  initial={{ color: "grey" }}
                  whileHover={{ color: "black" }}
                ></motion.i>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div id="responses">
        <p>{responseMsg}</p>
        {error && <p>{errorMsg}</p>}
      </div>
    </div>
  );
};

export default Layout;
