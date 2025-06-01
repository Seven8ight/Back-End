import {
  useEffect,
  useContext,
  createContext,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";

export type theme = "light" | "dark";

export const ThemeContext = createContext<{
    theme: theme;
    setTheme: Dispatch<SetStateAction<theme>>;
  }>({
    theme: "light",
    setTheme: () => {},
  }),
  ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<theme>(() => {
      const savedPreference = window.localStorage.getItem("theme") as theme;

      if (savedPreference) return savedPreference;
      else
        return window.matchMedia("(prefers-color-scheme:dark)").matches
          ? "dark"
          : "light";
    });

    useEffect(() => {
      localStorage.setItem("theme", theme);

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

    useEffect(() => {
      const listener = (event: MediaQueryListEvent) => {
        const sysTheme = event.matches ? "dark" : "light",
          savedPreference = window.localStorage.getItem("theme");

        if (!savedPreference) window.localStorage.setItem("theme", sysTheme);
      };

      const mediaQuery = window.matchMedia("(prefers-color-scheme:dark)");
      mediaQuery.addEventListener("change", listener);

      return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    return (
      <ThemeContext.Provider value={{ theme: theme, setTheme: setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };

export const useTheme = () => useContext(ThemeContext);

export default useTheme;
