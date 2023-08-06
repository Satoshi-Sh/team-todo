import "./App.css";
import React from "react";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import UpdateAccount from "./pages/UpdateAccount";
import Login from "./pages/Login";
import CreateProject from "./pages/CreateProject";
import SingleProject from "./pages/SingleProject";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import UpdateProject from "./pages/UpdateProject";
import { Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <div className="App">
      <UserProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/update-account/:userId" element={<UpdateAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/update-project/:projectId"
            element={<UpdateProject />}
          />
          <Route path="project/:id" element={<SingleProject />} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>
    </div>
  );
}

export default App;
