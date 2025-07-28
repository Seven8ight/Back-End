import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./Components/Index";
import Auth from "./Components/Auth";
import Add from "./Components/Add";
import Update from "./Components/Update";
import User from "./Components/User";
import Landing from "./Components/Landing";
import Expense from "./Components/Expense";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Landing />} />
        <Route path="/index" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/add" element={<Add />} />
        <Route path="/update/:id" element={<Update />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="/expense/:id" element={<Expense />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
