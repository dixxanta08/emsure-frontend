import { Link, Outlet } from "react-router-dom";

const TestLayout = ({ children }) => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
};
export default TestLayout;
