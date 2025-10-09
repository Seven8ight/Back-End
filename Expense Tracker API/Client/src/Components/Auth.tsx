import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router";

type params = {
  name: string;
  nameHandler: Dispatch<SetStateAction<string>>;
  email: string;
  emailHandler: Dispatch<SetStateAction<string>>;
  password: string;
  passwordHandler: Dispatch<SetStateAction<string>>;
  SubmitHandler: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};
type userCredentials = {
  name?: string;
  email: string;
  password: string;
};

const Signup = (params: params): React.ReactNode => {
    return (
      <>
        <form onSubmit={async (event) => params.SubmitHandler(event)}>
          <label>Name</label>
          <br />
          <input
            type="text"
            id="name"
            value={params.name}
            onChange={(event) => params.nameHandler(event.target.value)}
          />
          <br />
          <label htmlFor="email">Email</label>
          <br />
          <input
            type="text"
            id="email"
            value={params.email}
            onChange={(event) => params.emailHandler(event.target.value)}
          />
          <br />
          <label htmlFor="password">Password</label>
          <br />
          <input
            type="text"
            id="password"
            value={params.password}
            onChange={(event) => params.passwordHandler(event.target.value)}
          />
          <br />
          <button type="submit">Sign Up</button>
        </form>
      </>
    );
  },
  Login = (params: Omit<params, "name" | "nameHandler">): React.ReactNode => {
    return (
      <>
        <form onSubmit={async (event) => params.SubmitHandler(event)}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={params.email}
            onChange={(event) => params.emailHandler(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            value={params.password}
            onChange={(event) => params.passwordHandler(event.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </>
    );
  };

const Auth = (): React.ReactNode => {
  const navigate = useNavigate();

  const [page, setPage] = useState<"login" | "signup">("signup"),
    [name, setName] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>("");

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const urlType = page == "login" ? "login" : "register",
      userCredentials: userCredentials = {
        name: name,
        email: email,
        password: password,
      };

    if (urlType == "login") delete userCredentials.name;

    const request = await fetch(`http://localhost:3000/accounts/${urlType}`, {
        method: "POST",
        body: JSON.stringify(userCredentials),
      }),
      response = await request.json();

    if (
      (request.status == 201 || request.status == 200) &&
      response.message.accessToken
    )
      window.localStorage.setItem(
        "userTokens",
        JSON.stringify({
          accessToken: response.message.accessToken,
          refreshToken: response.message.refreshToken,
        })
      );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      (async () => {
        let request = await fetch("http://localhost:3000/accounts/user", {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }),
          response = await request.json();

        if (request.status == 200 && response.message.id) navigate("/home");
        else window.localStorage.removeItem("token");
      })();
    }
  }, []);

  return (
    <div id="Auth">
      <div id="selectors">
        <button type="button" onClick={() => setPage("signup")}>
          Sign Up
        </button>
        <button type="button" onClick={() => setPage("login")}>
          Log In
        </button>
      </div>
      {page == "login" ? (
        <Login
          email={email}
          emailHandler={setEmail}
          password={password}
          passwordHandler={setPassword}
          SubmitHandler={submitHandler}
        />
      ) : (
        <Signup
          name={name}
          nameHandler={setName}
          email={email}
          emailHandler={setEmail}
          password={password}
          passwordHandler={setPassword}
          SubmitHandler={submitHandler}
        />
      )}
    </div>
  );
};

export default Auth;
