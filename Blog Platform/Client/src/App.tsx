import { useEffect } from "react";

const App = (): React.ReactNode => {
  useEffect(() => {
    (async () => {
      let testRequest: Response = await fetch(
          "http://localhost:3000/something/route",
          {
            method: "GET",
          }
        ),
        updateRequest: Response = await fetch(
          "http://localhost:3000/blogs/update/876cc181-1ef1-4c88-a539-275f48acfc5f",
          {
            method: "PUT",
            body: JSON.stringify({
              title: "A new title here",
              content:
                "Some new content in here as well for testing the update api",
            }),
          }
        ),
        // tagRequest: Response = await fetch(
        //   "http://localhost:3000/blogs/tags/search?=Programming"
        // ),
        // deleteRequest: Response = await fetch(
        //   "http://localhost:3000/blogs/delete/185a06c2-b7e1-4ec9-91f9-72de0f333085"
        // ),
        // createRequest: Response = await fetch(
        //   "http://localhost:3000/blogs/create",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       title: "blog 2",
        //       content: "Some other text in here",
        //       category: "Programming",
        //       tags: ["Tech", "Programming", "Node Js"],
        //     }),
        //   }
        // ),
        getBlogs: Response = await fetch("http://localhost:3000/blogs/list"),
        // getBlog: Response = await fetch(
        //   "http://localhost:3000/blogs/delete/ae363948-e93c-432b-b104-57504cc16465"
        // ),
        testResponse: any = await testRequest.json(),
        // updateResponse: any = await updateRequest.json();
        // createResponse: any = await createRequest.json();
        getResponse: any = await getBlogs.json();
      // getBlogResponse: any = await getBlog.json(),
      // tagResponse: any = await tagRequest.json(),
      // deleteResponse: any = await deleteRequest.json();

      if (!testRequest.ok) console.log("Connection unsuccessful");
      else {
        console.log("Connection successful");
        console.log(testResponse);
      }
      // if (!updateRequest.ok) console.log("Update unsuccessful");
      // else {
      //   console.log("Update successful");
      //   console.log(updateResponse);
      // }

      // if (!createRequest.ok) console.log("API connection unsuccessful");
      // else {
      //   console.log("Successful");
      //   console.log(createResponse);
      // }

      if (!getBlogs.ok)
        console.log("API Connection unsuccessful on listing urls");
      else {
        console.log("Successful");
        console.log(
          JSON.parse((getResponse.Blogs as string).replace(/\g/, ""))
        );
      }
      // if (!getBlog.ok)
      //   console.log("API Connection unsuccessful on listing urls");
      // else {
      //   console.log("Successful");
      //   console.log(getBlogResponse);
      // }
      // if (!tagRequest.ok) console.log("Connection unsuccessful");
      // else {
      //   console.log("Connection successful to tag request");
      //   console.log(tagResponse);
      // }
      // if (!deleteRequest.ok) console.log("Connection unsuccessful");
      // else {
      //   console.log("Connection successful to tag request");
      //   console.log(deleteResponse);
      // }
    })();
  }, []);
  return (
    <div>
      <h1>Hello world</h1>
    </div>
  );
};

export default App;
