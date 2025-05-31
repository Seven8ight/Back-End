import {
  createContext,
  useState,
  useContext,
  type Dispatch,
  type SetStateAction,
  useEffect,
} from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Components/Home";
import Add from "./Components/Add";

export type theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: theme;
  setTheme: Dispatch<SetStateAction<theme>>;
}>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return { theme, setTheme };
};

const App = (): React.ReactNode => {
  const [theme, setTheme] = useState<theme>("light");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-color-scheme:dark)") &&
      window.matchMedia("(prefers-color-scheme:dark)").matches
    )
      setTheme("dark");
    else setTheme("light");

    window
      .matchMedia("(prefers-color-scheme:dark)")
      .addEventListener("change", (event) => {
        setTheme(event.media.match("dark") ? "dark" : "light");
      });
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     let testRequest: Response = await fetch(
  //         "http://localhost:3000/something/route",
  //         {
  //           method: "GET",
  //         }
  //       ),
  //       // updateRequest: Response = await fetch(
  //       //   "http://localhost:3000/blogs/update/876cc181-1ef1-4c88-a539-275f48acfc5f",
  //       //   {
  //       //     method: "PUT",
  //       //     body: JSON.stringify({
  //       //       title: "A new title here",
  //       //       content:
  //       //         "Some new content in here as well for testing the update api",
  //       //     }),
  //       //   }
  //       // ),
  //       // tagRequest: Response = await fetch(
  //       //   "http://localhost:3000/blogs/tags/search?=Programming"
  //       // ),
  //       // deleteRequest: Response = await fetch(
  //       //   "http://localhost:3000/blogs/delete/185a06c2-b7e1-4ec9-91f9-72de0f333085"
  //       // ),
  //       createRequest: Response = await fetch(
  //         "http://localhost:3000/blogs/create",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             title: "Blog 2",
  //             content: "Some other text in here",
  //             category: "Programming",
  //             tags: ["Life", "Living"],
  //           }),
  //         }
  //       ),
  //       // getBlogs: Response = await fetch("http://localhost:3000/blogs/list"),
  //       // getBlog: Response = await fetch(
  //       //   "http://localhost:3000/blogs/delete/ae363948-e93c-432b-b104-57504cc16465"
  //       // ),
  //       // testResponse: any = await testRequest.json(),
  //       // updateResponse: any = await updateRequest.json();
  //       createResponse: any = await createRequest.json();
  //     // getResponse: any = await getBlogs.json();
  //     // getBlogResponse: any = await getBlog.json(),
  //     // tagResponse: any = await tagRequest.json(),
  //     // deleteResponse: any = await deleteRequest.json();

  //     // if (!testRequest.ok) console.log("Connection unsuccessful");
  //     // else {
  //     //   console.log("Connection successful");
  //     //   console.log(testResponse);
  //     // }
  //     // if (!updateRequest.ok) console.log("Update unsuccessful");
  //     // else {
  //     //   console.log("Update successful");
  //     //   console.log(updateResponse);
  //     // }

  //     if (!createRequest.ok) console.log("API connection unsuccessful");
  //     else {
  //       console.log("Successful");
  //       console.log(createResponse);
  //     }

  //     // if (!getBlogs.ok)
  //     //   console.log("API Connection unsuccessful on listing urls");
  //     // else {
  //     //   console.log("Successful");
  //     //   console.log(
  //     //     JSON.parse((getResponse.Blogs as string).replace(/\g/, ""))
  //     //   );
  //     // }
  //     // if (!getBlog.ok)
  //     //   console.log("API Connection unsuccessful on listing urls");
  //     // else {
  //     //   console.log("Successful");
  //     //   console.log(getBlogResponse);
  //     // }
  //     // if (!tagRequest.ok) console.log("Connection unsuccessful");
  //     // else {
  //     //   console.log("Connection successful to tag request");
  //     //   console.log(tagResponse);
  //     // }
  //     // if (!deleteRequest.ok) console.log("Connection unsuccessful");
  //     // else {
  //     //   console.log("Connection successful to tag request");
  //     //   console.log(deleteResponse);
  //     // }
  //   })();
  // }, []);
  return (
    <ThemeContext.Provider value={{ theme: theme, setTheme: setTheme }}>
      <BrowserRouter>
        <Routes>
          <Route index path="/" Component={Home} />
          <Route path="/add" Component={Add} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
