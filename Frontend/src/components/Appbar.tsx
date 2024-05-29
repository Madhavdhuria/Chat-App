import { useNavigate } from "react-router-dom";
import { User } from "../Recoil";
import { useSetRecoilState } from "recoil";
const Appbar = ({ name }: { name: string }) => {
  const navigate = useNavigate();
  const setUserCookie = useSetRecoilState(User);
  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUserCookie(null);
    navigate("/signup");
  };

  return (
    <div className="flex bg-gray-200 justify-between px-4 py-2">
      <p>{name[0].toUpperCase()}</p>
      <button
        onClick={handleLogout}
        className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
      >
        Logout
      </button>
    </div>
  );
};

export default Appbar;
