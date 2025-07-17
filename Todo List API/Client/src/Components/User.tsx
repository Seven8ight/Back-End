import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

type User = {
  id: string;
  name: string;
  email: string;
};

const User = (): React.ReactNode => {
  const navigation = useNavigate(),
    [name, setName] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>(""),
    [error, setError] = useState<boolean>(false),
    [errorMsg, setErrorMsg] = useState<string>(""),
    [responseMsg, setResponseMsg] = useState<string>(""),
    [user, setUser] = useState<User>({
      id: "",
      name: "",
      email: "",
    });

  const updateUserHandler = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      let accessT = window.localStorage.getItem("accessToken");

      if (accessT) {
        let userUpdateRequest: Response = await fetch(
            "http://localhost:3000/accounts/update",
            {
              method: "PUT",
              headers: {
                "Content-type": "application/json",
                Authorization: `${accessT}`,
              },
              body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                id: user?.id,
              }),
            }
          ),
          userUpdateResponse = await userUpdateRequest.json();

        if (!userUpdateRequest.ok) {
          setError(true);
          setErrorMsg(userUpdateResponse.message);
        } else setResponseMsg("Credentials updated successfully");
      }
    },
    fetchUser = async () => {
      let accessT = window.localStorage.getItem("accessToken");

      if (accessT) {
        (async () => {
          let profileRequest: Response = await fetch(
              "http://localhost:3000/accounts/profile",
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: `${accessT}`,
                },
              }
            ),
            profileResponse = await profileRequest.json();

          if (!profileRequest.ok) console.log(profileResponse);
          else {
            setUser({
              id: profileResponse.message.id,
              name: profileResponse.message.name,
              email: profileResponse.message.email,
            });
          }
        })();
      } else {
        setError(true);
        setErrorMsg("User not found, please try again, redirecting");
        setTimeout(() => navigation("/auth"), 2000);
      }
    },
    logOutProcess = () => {
      window.localStorage.clear();
      setResponseMsg("Successfully Logged out, redirecting");
      setTimeout(() => {
        navigation("/auth");
      }, 2500);
    };

  useEffect(() => {
    (() => fetchUser())();
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      if (error) setError(false);
      if (responseMsg.length > 0) setResponseMsg("");

      (async () => {
        setName("");
        setEmail("");
        setPassword("");

        fetchUser();
      })();
    }, 2000);
  }, [error, responseMsg]);

  return (
    <div id="User">
      <div id="navigate">
        <button onClick={() => navigation("/")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Update User</h1>
      </div>
      <div id="form">
        <form onSubmit={(event) => updateUserHandler(event)}>
          <label>Username</label>
          <br />
          <input
            type="text"
            placeholder={user?.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <br />
          <label>Email</label>
          <br />
          <input
            type="text"
            placeholder={user?.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <br />
          <label>Password</label>
          <br />
          <input
            type="text"
            placeholder={"Hidden"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Update</button>
        </form>
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
      <div id="logout">
        <button onClick={() => logOutProcess()}>Log Out</button>
      </div>
    </div>
  );
};

export default User;
