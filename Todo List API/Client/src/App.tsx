import { BrowserRouter, Routes, Route } from "react-router";
import AuthPage from "./Components/Auth";
import Layout from "./Components/Layout";
import Update from "./Components/Update";
import User from "./Components/User";

const App = (): React.ReactNode => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Layout />}></Route>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/update/:id" element={<Update />} />
        <Route path="/user/:id" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
