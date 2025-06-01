import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Components/Home";
import Add from "./Components/Add";
import BlogView from "./Components/Blog";
import Update from "./Components/Update";
import { ThemeProvider } from "./Components/Hooks/useTheme";

const App = (): React.ReactNode => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route index path="/" Component={Home} />
          <Route path="/add" Component={Add} />
          <Route path="/blog/:id" Component={BlogView} />
          <Route path="/blog/update/:id" Component={Update} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
