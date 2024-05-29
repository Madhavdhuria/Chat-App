import axios from "axios";
import { useEffect, useState } from "react";
import Appbar from "./components/Appbar";

function App() {
  console.log("app");

  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [OnlinePeople, setOnlinepeople] = useState({});
  const [SelectedUser, setSelectedUser] = useState("");

  const showpeople = (peopleArray: { userId: string; username: string }[]) => {
    const uniquePeople: any = {};
    peopleArray.forEach(({ userId, username }) => {
      uniquePeople[userId] = username;
    });
    setOnlinepeople(uniquePeople);
  };
  useEffect(() => {
    const wsconnection = new WebSocket("ws://localhost:3000");
    setWs(wsconnection);

    wsconnection.addEventListener("message", (e) => {
      const data: any = JSON.parse(e.data);
      if ("online" in data) {
        showpeople(data.online);
      }
    });

    const getInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        setUserInfo(response.data.userInfo);
      } catch (err: any) {
        setError(err);
      }
    };
    getInfo();

    // Cleanup WebSocket on component unmount
    return () => {
      wsconnection.close();
    };
  }, []);

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (userInfo) {
    return (
      <div>
        <Appbar name={userInfo.name} />
        <div className="h-screen flex">
          <div className="w-[33%] bg-white">
            <h1 className="text-center text-3xl text-blue-400">Online Users</h1>
            <div className="mt-3">
              {Object.keys(OnlinePeople).map((userId) => (
                <div
                  className={`text-center border-b border-blue-50 py-3 ${
                    SelectedUser === userId ? "bg-slate-100" : ""
                  } `}
                  key={userId}
                  onClick={() => {
                    setSelectedUser(userId);
                  }}
                >
                  {OnlinePeople[userId]}
                </div>
              ))}
            </div>
          </div>
          <div className="w-[67%] bg-slate-100">
            <h2 className="text-3xl text-center">Chat</h2>
            <div className="mb-6 flex gap-2 items-center absolute bottom-1 w-[50%]">
              <input
                type="text"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 w-full focus:border-blue-500 block p-2.5"
                placeholder="Enter Your message"
                required
              />
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default App;
