import { useState, useEffect, useReducer } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Sun, Moon } from "./Icons/Icons";
import { useTheme, type theme } from "../App";
import ProfileImg from "./../Assets/unnamed-2.png";

type Blog = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};
type action = {
  type: "add" | "remove";
  payload: string;
};

const reducer = (state: string[], action: action) => {
  switch (action.type) {
    case "add":
      return state.includes(action.payload)
        ? state
        : [...state, action.payload];
    case "remove":
      return state.filter((tag) => tag != action.payload);
    default:
      return state;
  }
};

const Error = (): React.ReactNode => {
    return <h1>Error occured</h1>;
  },
  Loading = (): React.ReactNode => {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    );
  },
  InfoModal = (): React.ReactNode => {
    return (
      <motion.div id="info">
        <div id="blurContainer"></div>
        <div id="modal">
          <div id="profileCard">
            <img src={ProfileImg} />
            <div id="details">
              <p>
                Made by <b>78ight</b>
              </p>
              <p>Nai, Kenya</p>
              <div id="socials">
                <Link to={"#"} target="_blank">
                  <motion.i
                    whileHover={{
                      scale: 1.1,
                    }}
                    className="fa-brands fa-instagram"
                  ></motion.i>
                </Link>
                <Link to={"https://x.com/home"} target="_blank">
                  <motion.i
                    whileHover={{
                      scale: 1.1,
                    }}
                    className="fa-brands fa-x-twitter"
                  ></motion.i>
                </Link>
                <Link to="https://github.com/Seven8ight" target="_blank">
                  <i className="fa-brands fa-github"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

const Home = (): React.ReactNode => {
  const [blogs, setBlogs] = useState<Blog[]>([]),
    [loading, setLoading] = useState<boolean>(false),
    [error, setError] = useState<boolean>(false),
    [blogTags, setTags] = useState<string[]>([]),
    [filterBlogs, dispatch] = useReducer(reducer, []),
    [infoModal, setModal] = useState<boolean>(false),
    { theme, setTheme } = useTheme(),
    themeHandler = (theme: theme) => setTheme(theme);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const getBlogsRequest: Response = await fetch(
        "http://localhost:3000/blogs/list"
      );

      if (!getBlogsRequest.ok) setError(true);
      else {
        const getBlogsResponse = await getBlogsRequest.json();

        if (getBlogsResponse.Blogs)
          setBlogs(
            JSON.parse((getBlogsResponse.Blogs as string).replace(/\g/, ""))
          );
        else setBlogs(getBlogsResponse);

        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (blogs.length > 0)
      for (let i = 0; i <= blogs.length - 1; i++) {
        let tags = blogs[i].tags;
        setTags((currenttags) => [...currenttags, ...tags]);
      }
  }, [blogs]);

  useEffect(() => {
    if (theme == "dark") {
      document.body.style.backgroundColor = "rgb(39,36,36)";
      document.documentElement.style.setProperty("--color-font", "white");
      document.documentElement.style.setProperty("--divider-color", "white");
    } else {
      document.body.style.backgroundColor = "#f1f0f0";
      document.documentElement.style.setProperty("--color-font", "black");
      document.documentElement.style.setProperty("--divider-color", "black");
    }
  }, [theme]);

  return (
    <motion.div id="home">
      <nav>
        <h1>Inclyne Blogs</h1>
        <div>
          <Link to="/add">
            <i className="fa-solid fa-plus"></i>
          </Link>
        </div>
        <div id="liner" />
      </nav>
      <div id="sidebar">
        <div id="filters">
          <h3>Tags</h3>
          <div id="tags">
            {blogTags.length == 0 && <div>No blogs present</div>}
            {blogTags.length > 0 &&
              blogTags.map((tag, index) => {
                return (
                  <motion.button
                    onClick={(event) => {
                      const bg = getComputedStyle(
                        event.currentTarget
                      ).backgroundColor;

                      if (bg == "transparent" || bg == "rgba(0, 0, 0, 0)") {
                        dispatch({
                          type: "add",
                          payload: event.currentTarget.innerHTML,
                        });
                        event.currentTarget.style.backgroundColor =
                          "rgba(81, 197, 195, 0.75)";
                      } else {
                        event.currentTarget.style.backgroundColor =
                          "transparent";
                        dispatch({
                          type: "remove",
                          payload: event.currentTarget.innerHTML,
                        });
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    key={index}
                  >
                    {tag}
                  </motion.button>
                );
              })}
          </div>
        </div>
        <div id="options">
          {theme == "light" ? (
            <Moon
              onClick={() => themeHandler("dark")}
              color={theme == "light" ? "black" : "white"}
            />
          ) : (
            <Sun color="white" onClick={() => themeHandler("light")} />
          )}
          <i
            onClick={() => setModal(!infoModal)}
            className="fa-solid fa-circle-info"
          ></i>
        </div>
      </div>
      {error && <Error />}
      {loading && <Loading />}
      {blogs &&
        blogs.length > 0 &&
        filterBlogs.length == 0 &&
        blogs.map((blog, index) => {
          if (index + 1 != blogs.length)
            return (
              <div key={blog.id + index}>
                <motion.div
                  id="blog"
                  key={blog.id}
                  whileHover={{
                    scale: 0.95,
                    border: "1px solid rgba(100,100,100,0.25)",
                    boxShadow: "5px 5px 5px 0px rgba(200,200,200,0.5)",
                  }}
                >
                  <div id="header">
                    <h2>{blog.title}</h2>
                    <h3>{blog.category}</h3>
                  </div>
                  <p>{blog.content}</p>
                  <h4>{blog.tags.join(", ")}</h4>
                </motion.div>

                <div id="divider" key={index} />
              </div>
            );
          else
            return (
              <div key={blog.id + index}>
                <motion.div
                  key={blog.id}
                  id="blog"
                  whileHover={{
                    scale: 0.95,
                    border: "1px solid rgba(100,100,100,0.25)",
                    boxShadow: "5px 5px 5px 0px rgba(200,200,200,0.5)",
                  }}
                >
                  <div id="header">
                    <h2>{blog.title}</h2>
                    <h3>{blog.category}</h3>
                  </div>

                  <p>{blog.content}</p>
                  <h4>{blog.tags.join(", ")}</h4>
                </motion.div>
              </div>
            );
        })}

      {filterBlogs.length > 0 &&
        blogs.map((blog, index) => {
          let filter =
            filterBlogs.length < 2
              ? blog.tags.some((tag) => filterBlogs.includes(tag))
              : blog.tags.every((tag) => filterBlogs.includes(tag));

          if (filter) {
            return (
              <div key={blog.id + index}>
                <motion.div
                  id="blog"
                  key={blog.id}
                  whileHover={{
                    scale: 0.95,
                    border: "1px solid rgba(100,100,100,0.25)",
                    boxShadow: "5px 5px 5px 0px rgba(200,200,200,0.5)",
                  }}
                >
                  <div id="header">
                    <h2>{blog.title}</h2>
                    <h3>{blog.category}</h3>
                  </div>
                  <p>{blog.content}</p>
                  <h4>{blog.tags.join(", ")}</h4>
                </motion.div>

                <div id="divider" key={index} />
              </div>
            );
          }
        })}

      {blogs.length == 0 && (
        <div>
          <h1>No blogs added</h1>
        </div>
      )}

      {infoModal && <InfoModal />}
    </motion.div>
  );
};

export default Home;
