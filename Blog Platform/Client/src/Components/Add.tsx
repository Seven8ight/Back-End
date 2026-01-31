import { Link } from "react-router";
import { useRef } from "react";
import { motion } from "motion/react";
import { useTheme } from "./Hooks/useTheme";
import { Moon, Sun } from "./Icons/Icons";

const Add = (): React.ReactNode => {
  const { theme, setTheme } = useTheme(),
    formRef = useRef<HTMLFormElement>(null),
    submitBtnRef = useRef<HTMLButtonElement>(null);

  const submissionEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitBtnRef && submitBtnRef.current) {
      submitBtnRef.current.innerHTML = "Submitting";
      submitBtnRef.current.disabled = true;
    }

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    const title = formData.get("title"),
      category = formData.get("category"),
      tags = formData.get("tags"),
      content = formData.get("content");

    (async () => {
      try {
        let creationRequest = await fetch(
          "http://localhost:3000/blogs/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: title,
              category: category,
              tags: (tags as string).split(",").map((tag) => tag.trim()),
              content: content,
            }),
          },
        );

        if (submitBtnRef.current) {
          if (!creationRequest.ok) {
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
    })();
  };

  return (
    <>
      <div id="Add">
        <div id="header">
          <Link to="/">
            <motion.i
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 1 }}
              className="fa-solid fa-arrow-left"
            ></motion.i>
          </Link>
          <h1>Add Blog</h1>
          <p>
            {theme == "dark" ? (
              <Sun color="white" onClick={() => setTheme("light")} />
            ) : (
              <Moon color="black" onClick={() => setTheme("dark")} />
            )}
          </p>
        </div>
        <div id="form">
          <form onSubmit={(event) => submissionEvent(event)} ref={formRef}>
            <label htmlFor="title">Blog title</label>
            <br />
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              required
            />
            <br />
            <label htmlFor="category">Category</label>
            <br />
            <input
              type="text"
              id="category"
              name="category"
              placeholder="Category"
              required
            />
            <br />
            <label htmlFor="tags">Tags</label>
            <br />
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="tag1, tag2"
              required
            />
            <br />
            <label htmlFor="content">Content</label>
            <br />
            <textarea
              cols={57}
              rows={25}
              id="content"
              name="content"
              required
            ></textarea>
            <br />
            <button ref={submitBtnRef} type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Add;
