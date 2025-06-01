import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { useTheme } from "./Hooks/useTheme";
import { Sun, Moon } from "./Icons/Icons";
import { type Blog } from "./Home";

const Update = (): React.ReactNode => {
  const { id } = useParams<{ id: string }>(),
    formRef = useRef<HTMLFormElement>(null),
    submitBtnRef = useRef<HTMLButtonElement>(null),
    [blog, setBlog] = useState<Blog>(),
    [error, setError] = useState<boolean>(false),
    { theme, setTheme } = useTheme();

  const formSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement),
      updateData: Record<string, string | string[]> = {};

    for (let [key, value] of formData.entries()) {
      if (value.toString().length > 0 && key != "tags")
        updateData[key] = value.toString();
      else if (key == "tags")
        updateData["tags"] = value
          .toString()
          .split(",")
          .map((value) => value.trim());
    }

    try {
      let updateRequest = await fetch(
        `http://localhost:3000/blogs/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (submitBtnRef.current) {
        if (!updateRequest.ok) {
          submitBtnRef.current.style.backgroundColor = "red";
          submitBtnRef.current.innerHTML = "Failed, try again";
        } else {
          submitBtnRef.current.style.backgroundColor = "green";
          submitBtnRef.current.innerHTML = "Success";
        }
      }
    } catch (error) {
      if (submitBtnRef.current) {
        submitBtnRef.current.style.backgroundColor = "red";
        submitBtnRef.current.innerHTML = "Failed, try again";
      }
    }

    setTimeout(() => {
      if (submitBtnRef.current) {
        submitBtnRef.current.style.backgroundColor = "transparent";
        submitBtnRef.current.innerHTML = "Submit";
      }
    }, 2500);
  };

  formRef.current?.addEventListener("submit", formSubmit);

  useEffect(() => {
    (async () => {
      try {
        const blogFetchRequest = await fetch(
          `http://localhost:3000/blogs/blog/${id}`
        );

        if (!blogFetchRequest.ok) setError(true);
        else {
          let blogResponse = await blogFetchRequest.json();
          setBlog(blogResponse);
        }
      } catch (error) {
        setError(true);
      }
    })();
  }, []);

  return (
    <div id="update">
      <div id="header">
        <motion.i
          onClick={() => window.location.assign("http://localhost:5173")}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 1 }}
          className="fa-solid fa-arrow-left"
        ></motion.i>

        <h1>Update Blog</h1>
        <p>
          {theme == "dark" ? (
            <Sun color="white" onClick={() => setTheme("light")} />
          ) : (
            <Moon color="black" onClick={() => setTheme("dark")} />
          )}
        </p>
      </div>
      {blog && (
        <div id="form">
          <form ref={formRef}>
            <label htmlFor="title">Blog title</label>
            <br />
            <input
              type="text"
              id="title"
              name="title"
              placeholder={blog.title}
            />
            <br />
            <label htmlFor="category">Category</label>
            <br />
            <input
              type="text"
              id="category"
              name="category"
              placeholder={blog.category}
            />
            <br />
            <label htmlFor="tags">Tags</label>
            <br />
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder={
                Array.isArray(blog.tags)
                  ? blog.tags.join(", ")
                  : (blog.tags as unknown as string)
                      .replace(/[\[\]\\"]/g, "")
                      .split(",")
                      .join(", ")
              }
            />
            <br />
            <label htmlFor="content">Content</label>
            <br />
            <textarea
              cols={57}
              rows={25}
              id="content"
              name="content"
              placeholder={blog.content}
            ></textarea>
            <br />
            <button ref={submitBtnRef} type="submit">
              Submit
            </button>
          </form>
        </div>
      )}
      {error && (
        <div>
          <h1>Error occured</h1>
        </div>
      )}
    </div>
  );
};

export default Update;
