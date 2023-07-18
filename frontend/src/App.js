import "./App.css";
import React from "react";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
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
          <Route path="/login" element={<Login />} />
          <Route path="/Projects" element={<Projects />} />
        </Routes>
      </UserProvider>
    </div>
  );
}

export default App;
