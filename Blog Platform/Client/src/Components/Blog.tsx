import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { type Blog } from "./Home";

const BlogView = (): React.ReactNode => {
  const { id } = useParams(),
    [error, setError] = useState<Boolean>(false),
    [deleteError, setDError] = useState<Boolean>(false),
    [deleteSuccess, setSuccess] = useState<Boolean>(false),
    [blog, setBlog] = useState<Blog>(),
    navigation = useNavigate(),
    deleteHandler = async (id: string) => {
      try {
        const deleteRequest = await fetch(
          `http://localhost:3000/blogs/delete/${id}`
        );

        if (!deleteRequest.ok) setDError(true);
        else {
          setSuccess(true);
          setTimeout(() => {
            navigation("/");
          }, 1500);
        }
      } catch (error) {
        setDError(true);
      }
    };

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

  useEffect(() => {
    const timerReset = setTimeout(() => {
      if (deleteError) setDError(false);
    });

    return () => clearTimeout(timerReset);
  }, [deleteError]);

  return (
    <div id="Blog">
      <div id="back">
        <Link to="/">
          <motion.i
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 1 }}
            className="fa-solid fa-arrow-left"
          ></motion.i>
        </Link>
      </div>
      {error && (
        <div id="error">
          <p>Error here</p>
        </div>
      )}
      {blog != undefined && (
        <div id="blog">
          <div id="liner" />
          <div id="header">
            <h1>{blog.title}</h1>
            <div id="options">
              <Link to={`/blog/update/${blog.id}`}>
                <i className="fa-solid fa-pen-nib"></i>
              </Link>
              {deleteSuccess ? (
                <i
                  className="fa-solid fa-check"
                  style={{ color: "#63E6BE" }}
                ></i>
              ) : deleteError ? (
                <i className="fa-solid fa-x" style={{ color: "#b51a00" }}></i>
              ) : (
                <i
                  onClick={() => deleteHandler(blog.id)}
                  className="fa-solid fa-trash"
                ></i>
              )}
            </div>
          </div>

          <div id="tags">
            <p>{blog.category}</p>
            <p>
              {Array.isArray(blog.tags)
                ? blog.tags.join(", ")
                : (blog.tags as unknown as string)
                    .replace(/[\[\]\\"]/g, "")
                    .split(",")
                    .join(", ")}
            </p>
          </div>
          <div id="content">
            <p>{blog.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogView;
