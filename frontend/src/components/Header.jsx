import { Link, useLocation } from "react-router";
import useAuthStore from "../store/authStore";

function Header() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  const onLogout = () => {
    logout();
  };

  return (
    <header className="flex flex-row justify-between items-center h-12 text-white-text bg-blue-600">
      {/* <header className="bg-blue-600 text-white p-4 flex-shrink-0 shadow-md w-full"> */}
      <nav className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-white hover:cursor-pointer"
        >
          Chemnitz Cultural Sites
        </Link>
        {location.pathname !== "/auth" && (
          <ul className="flex space-x-6">
            {isAuthenticated ? (
              <li>
                <button
                  onClick={onLogout}
                  className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white font-bold py-1.5 px-3 rounded text-sm"
                >
                  Sign out
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={handleGoogleSignIn}
                  className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white font-bold py-1.5 px-3 rounded text-sm"
                >
                  Sign in
                </button>
              </li>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
}

export default Header;
