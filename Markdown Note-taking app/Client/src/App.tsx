import React, {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Markdown from "react-markdown";
import Turndown from "./Components/Markdown";

const fileHandler = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setFile?: Dispatch<SetStateAction<File | null>>
): Promise<void> => {
  const files = event.target.files;

  if (files && files.length > 0) {
    const file = files[0],
      formData = new FormData();

    if (setFile) setFile(file);

    formData.append("file", file);

    try {
      const fileForward = await fetch("http://localhost:3000/save", {
          method: "POST",
          body: formData,
        }),
        fileResponse = await fileForward.json();

      console.log(fileResponse);
    } catch (error) {
      console.log(error);
    }
  }
};

const Input = ({
    onChangeEvent,
    setFile,
  }: {
    setFile: Dispatch<SetStateAction<File | null>>;
    onChangeEvent: (
      event: React.ChangeEvent<HTMLInputElement>,
      setFile?: Dispatch<SetStateAction<File | null>>
    ) => Promise<void>;
  }): React.ReactNode => {
    return (
      <div id="Input">
        <h1>Markdown Application</h1>
        <p>Provide an markdown input file</p>
        <div id="input">
          <label id="label" htmlFor="file">
            Insert file
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".md"
            onChange={(event) => onChangeEvent(event, setFile)}
          />
        </div>
      </div>
    );
  },
  MarkdownViewer = ({
    files,
    currentFile,
    fileHandler,
  }: {
    files: Record<string, string>[];
    currentFile: File;
    fileHandler: (
      event: React.ChangeEvent<HTMLInputElement>,
      setFile?: Dispatch<SetStateAction<File | null>>
    ) => void;
  }): React.ReactNode => {
    const [fileContent, setContent] = useState<string>(""),
      [type, setType] = useState<"markdown" | "html">("markdown"),
      [htmlTag, setHTMLTag] = useState<HTMLDivElement | null>(null),
      [currentfile, setFile] = useState<File | null>(currentFile),
      [filesPresent, setFiles] = useState<Record<string, string>[]>(files),
      [currentFileName, setFileName] = useState<string>(""),
      [error, setError] = useState<boolean>(false),
      [errorMsg, setMsg] = useState<string>(""),
      [grammar, setGrammar] = useState<Record<string, string[]>[]>([]);

    const SwitchHandler = (fileName: string, fileContent: string) => {
        setFileName(fileName);
        setContent(fileContent);
      },
      FilesRetriever = async () => {
        try {
          let contents = await fetch("http://localhost:3000/get", {
              method: "GET",
            }),
            result = await contents.json();

          setFiles(result);
        } catch (error) {
          setError(true);
          setMsg(`Error: ${(error as Error).message}`);
        }
      },
      DeletionHandler = async () => {
        try {
          const deleteRequest: Response = await fetch(
            `http://localhost:3000/delete/${currentFileName}`,
            {
              method: "DELETE",
            }
          );

          if (deleteRequest.status == 204) {
            await FilesRetriever();
            if (filesPresent.length > 0)
              setContent(
                filesPresent[
                  Math.floor(Math.random() * (filesPresent.length - 1))
                ].fileContents
              );
          } else {
            setError(true);
            setMsg("No files doesnt exist");
          }
        } catch (error) {
          setError(true);
          setMsg(`Error in deletion, ${(error as Error).message}`);
        }
      };

    useEffect(() => {
      if (currentfile) setFileName(currentfile.name);

      (async () => {
        const fileReader = new FileReader();

        fileReader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target) setContent(event.target.result as string);
        };

        fileReader.onerror = (error: ProgressEvent<FileReader>) => {
          setError(true);
          setMsg(`Error in reading file: ${error.target?.error?.message}`);
        };

        fileReader.readAsText(currentfile!);
      })();
    }, [currentfile]);

    useEffect(() => {
      const markdownTag = document.querySelector<HTMLDivElement>("#html");

      if (markdownTag) setHTMLTag(markdownTag);
    }, [type]);

    useEffect(() => {
      (async () => await FilesRetriever())();
    }, [currentfile]);

    useEffect(() => {
      if (fileContent.length > 0) {
        (async () => {
          try {
            const grammarCheckRequest: Response = await fetch(
                "http://localhost:3000/grammar",
                {
                  method: "POST",
                  headers: {
                    accept: "application/json",
                  },
                  body: JSON.stringify({ fileContent: fileContent }),
                }
              ),
              grammarCheckResponse = await grammarCheckRequest.json();

            if (grammarCheckRequest.status == 200)
              setGrammar(grammarCheckResponse);
          } catch (error) {
            setError(true);
            setMsg(`Error: ${(error as Error).message}`);
          }
        })();
      }
    }, [fileContent]);

    return (
      <div id="MarkdownViewer">
        <div id="viewer">
          <button onClick={() => setType("markdown")}>
            <i className="fa-brands fa-markdown"></i>
          </button>
          <button onClick={() => setType("html")}>
            <i className="fa-solid fa-code"></i>
          </button>
        </div>
        {type == "markdown" ? (
          <div id="html">
            {fileContent && <Markdown>{fileContent}</Markdown>}
          </div>
        ) : (
          <Turndown htmlContent={htmlTag!} />
        )}

        <div id="list">
          {filesPresent.length == 0 && <p>No extra files</p>}
          {filesPresent.map((file, index) => (
            <button
              onClick={() => SwitchHandler(file.file, file.fileContents)}
              key={index}
            >
              {file.file}
            </button>
          ))}
        </div>
        <div id="options">
          <label htmlFor="file">
            <i className="fa-brands fa-add"></i>
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".md"
            onChange={(event) => fileHandler(event, setFile)}
            style={{ display: "none" }}
          />

          <button onClick={DeletionHandler}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
        <div id="ErrorSuggestions">
          <h3>Grammar suggestions</h3>
          {grammar.map((word, index) => {
            const [[key, values]] = Object.entries(word);

            return (
              <div key={index}>
                <p>{key}</p>
                <ul>
                  {values.map((value, index) => (
                    <li key={index}>{value}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {error && (
          <div id="error" className={error ? "entry" : "exit"}>
            <p>{errorMsg}</p>
            <button onClick={() => setError(false)}>Close error</button>
          </div>
        )}
      </div>
    );
  };

function App() {
  const [file, setFile] = useState<File | null>(null),
    [fileList, setFiles] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let contents = await fetch("http://localhost:3000/get", {
            method: "GET",
          }),
          result = await contents.json();

        setFiles(result);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return file ? (
    <MarkdownViewer
      files={fileList}
      currentFile={file}
      fileHandler={fileHandler}
    />
  ) : (
    <Input setFile={setFile} onChangeEvent={fileHandler} />
  );
}

export default App;
