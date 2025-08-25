import { BrowserRouter,Route,Routes } from "react-router";
import Home from "./Components/Home";
import Add from "./Components/Add";
import Landing from "./Components/Landing";
import Update from "./Components/Update";
import Auth from "./Components/Auth";

const App = ():React.ReactNode => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Landing}/>
        <Route index path="/home" Component={Home}/>
        <Route path="/add" Component={Add}/>
        <Route path="/update" Component={Update}/>
        <Route path="/auth" Component={Auth}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;