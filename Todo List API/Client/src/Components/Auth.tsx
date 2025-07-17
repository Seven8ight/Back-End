import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

type credentials = {
  eventSubmission: React.FormEventHandler<HTMLFormElement>;
  name: string;
  nameHandler: Dispatch<SetStateAction<string>>;
  email: string;
  emailHandler: Dispatch<SetStateAction<string>>;
  password: string;
  passwordHandler: Dispatch<SetStateAction<string>>;
};

const buttonAnimations = {
  initial: {
    rotate: -90,
  },
  hover: {
    scale: 1.1,
  },
};

const Login = ({
    eventSubmission,
    email,
    emailHandler,
    password,
    passwordHandler,
  }: Omit<credentials, "name" | "nameHandler">): React.ReactNode => {
    return (
      <div id="loginform">
        <h2>Login</h2>
        <p>Welcome back</p>
        <div id="liner" />
        <form method="POST" onSubmit={(event) => eventSubmission(event)}>
          <label>Email</label>
          <br />
          <input
            name="email"
            type="text"
            value={email}
            placeholder="email@g.com"
            required
            onChange={(event) => emailHandler(event.target.value)}
          />
          <br />
          <label>Password</label>
          <br />
          <input
            name="password"
            type="text"
            value={password}
            placeholder="pass here"
            required
            onChange={(event) => passwordHandler(event.target.value)}
          />
          <br />
          <button>Log in</button>
        </form>
      </div>
    );
  },
  Signup = ({
    eventSubmission,
    name,
    nameHandler,
    email,
    emailHandler,
    password,
    passwordHandler,
  }: credentials): React.ReactNode => {
    return (
      <div id="signupform">
        <h2>Signup</h2>
        <p>Join in on assigning tasks smarter</p>
        <div id="liner" />
        <form method="POST" onSubmit={(event) => eventSubmission(event)}>
          <label>Name</label>
          <br />
          <input
            type="text"
            value={name}
            name="name"
            placeholder="John Doe"
            required
            onChange={(event) => nameHandler(event.target.value)}
          />
          <br />
          <label>Email</label>
          <br />
          <input
            name="email"
            type="text"
            value={email}
            placeholder="example@g.com"
            required
            onChange={(event) => emailHandler(event.target.value)}
          />
          <br />
          <label>Password</label>
          <br />
          <input
            name="password"
            type="text"
            value={password}
            placeholder="pass"
            required
            onChange={(event) => passwordHandler(event.target.value)}
          />
          <br />
          <button>Signup</button>
        </form>
      </div>
    );
  },
  AuthPage = (): React.ReactNode => {
    const [name, setName] = useState<string>(""),
      [email, setEmail] = useState<string>(""),
      [password, setPassword] = useState<string>(""),
      [currentForm, setForm] = useState<"login" | "signup">("signup"),
      [error, setError] = useState<boolean>(),
      [errorMsg, setMsg] = useState<string>(""),
      navigation = useNavigate();

    const formHandler = (text: "login" | "signup") => setForm(text),
      submissionHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let formData = new FormData(event.target as HTMLFormElement),
          details: Record<string, string> = {};

        for (let [key, value] of formData.entries()) {
          details[key] = value as string;
        }

        (async () => {
          try {
            let typeSubmission = details["name"] ? "signup" : "login",
              accountRequest = await fetch(
                `http://localhost:3000/accounts/${
                  typeSubmission == "signup" ? "register" : "login"
                }`,
                {
                  method: "POST",
                  headers: {
                    "Content-type": "application/json",
                  },
                  body: JSON.stringify(details),
                }
              ),
              accountResponse = await accountRequest.json();

            if (!accountRequest.ok) {
              setError(true);
              setMsg(accountResponse.message);
              return;
            }

            localStorage.setItem("accessToken", accountResponse.accessToken);
            localStorage.setItem("refreshToken", accountResponse.refreshToken);

            navigation("/");
          } catch (error) {
            setError(true);
            setMsg("Network failure, please try again");
          }
        })();
      };

    useEffect(() => {
      let [accessToken, refreshToken] = [
        localStorage.getItem("accessToken"),
        localStorage.getItem("refreshToken"),
      ];
      if (accessToken || refreshToken) navigation("/");
    }, []);

    useEffect(() => {
      setName("");
      setEmail("");
      setPassword("");
    }, [currentForm]);

    useEffect(() => {
      let errorTimeout = setTimeout(() => setError(false), 2500);

      return () => clearTimeout(errorTimeout);
    }, [error]);

    return (
      <div id="Auth">
        <div id="selection">
          <motion.button
            variants={buttonAnimations}
            initial="initial"
            whileHover="hover"
            onClick={() => formHandler("login")}
          >
            Login
          </motion.button>
          <motion.button
            variants={buttonAnimations}
            initial="initial"
            whileHover={{
              backgroundColor: "rgba(235,235,235,0.5)",
              scale: 1.1,
            }}
            onClick={() => formHandler("signup")}
          >
            Sign Up
          </motion.button>
        </div>
        {currentForm == "login" ? (
          <Login
            eventSubmission={submissionHandler}
            email={email}
            emailHandler={setEmail}
            password={password}
            passwordHandler={setPassword}
          />
        ) : (
          <Signup
            eventSubmission={submissionHandler}
            name={name}
            nameHandler={setName}
            email={email}
            emailHandler={setEmail}
            password={password}
            passwordHandler={setPassword}
          />
        )}
        {error && (
          <div id="error">
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    );
  };

export default AuthPage;
