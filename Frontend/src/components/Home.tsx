import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();
  const goToSignup = () => {
    navigate("/signup");
  };

  const goToLogin = () => {
    navigate("/signin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="space-x-4">
        <button
          onClick={goToSignup}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
        >
          Sign Up
        </button>
        <button
          onClick={goToLogin}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Home;
