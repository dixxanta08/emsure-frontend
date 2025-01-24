import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./features/authentication/pages/Login";
import NotFound from "./pages/NotFound";
import TestLayout from "./layout/TestLayout";
import Test from "./pages/Test";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import MainLayout from "./layout/MainLayout";
import AgentsForm from "./features/people & organizations/components/forms/AgentsForm";

const App = () => {
  return (
    <>
      {/* <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav> */}
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route element={<MainLayout />}>
              <Route path="/test" element={<Test />} />
              <Route path="/people-organizations">
                <Route path="agents" element={<AgentsForm />} />
                <Route index element={<Test />} />
              </Route>
            </Route>
          </Route>
          <Route element={<TestLayout />}>
            {/* <Route path='/books/*' element={<BookRoutes/>}/> */}
            <Route index path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
            <Route />
          </Route>
          {/* <Route path="/" element={<TestLayout />}>
          <Route index element={<Home />} />
          {/* <Route path="/books">
          <Route index element={<BookList />} />
          <Route path=":id" element={<Book />} /> useParams(), useOutletContext()
        </Route> 
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
          <Route />
        </Route> */}
        </Routes>
      </AuthProvider>
    </>
  );
};

export default App;
