import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/interview.jsx";
import Protected from "./components/Protected.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/interview/:interviewId" element={<Protected><Interview /></Protected>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



