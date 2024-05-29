import axios from "axios";
import { useEffect, useState } from "react";
import Appbar from "./components/Appbar";

type UserInfo = {
  id: string;
  name: string;
};

type OnlineUser = {
  userId: string;
  username: string;
};

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlinePeople, setOnlinePeople] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = () => {
    if (ws && userInfo) {
      ws.send(
        JSON.stringify({
          messagedata: {
            senderName: userInfo.name,
            senderId: userInfo.id,
            recipient: selectedUser,
            text: inputMessage,
          },
        })
      );
      setMessages((prev) => [...prev, { text: inputMessage, isOur: true }]);
      setInputMessage("");
    }
  };

  const showPeople = (peopleArray: OnlineUser[]) => {
    const uniquePeople: Record<string, string> = {};
    peopleArray.forEach(({ userId, username }) => {
      uniquePeople[userId] = username;
    });
    setOnlinePeople(uniquePeople);
  };
  console.log(messages);

  useEffect(() => {
    const wsConnection = new WebSocket("ws://localhost:3000");
    setWs(wsConnection);

    wsConnection.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if ("online" in data) {
        showPeople(data.online);
      } else {
        const text = data.data;
        const { senderName } = data;
        setMessages((prev) => [
          ...prev,
          {
            senderName,
            isOur: false,
            text,
          },
        ]);
      }
    });

    const getInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        setUserInfo(response.data.userInfo);
      } catch (err) {
        setError(err as Error);
      }
    };
    getInfo();

    return () => {
      wsConnection.close();
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
            <h1 className="text-center text-3xl my-4 text-blue-400">
              Online Users
            </h1>
            <div className="mt-3 cursor-pointer">
              {Object.keys(onlinePeople).map((userId) => {
                return userId !== String(userInfo.id) ? (
                  <div
                    className={`text-center border-b border-blue-50 py-3 ${
                      selectedUser === userId
                        ? "bg-slate-100 text-blue-500"
                        : ""
                    } `}
                    key={userId}
                    onClick={() => {
                      setSelectedUser(userId);
                    }}
                  >
                    {onlinePeople[userId]}
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <div className="w-[67%] bg-slate-100">
            <h2 className="text-3xl text-center">Chat</h2>
            {!selectedUser && <p>Select a person from the sidebar</p>}
            <div>
              {messages.map((message: any, index: any) => (
                <div key={index}>
                  <div className={" flex gap-4"}>
                    <p>
                      {" "}
                      {!message.isOur ? `sender -  ${message.senderName} ` : ""}
                    </p>
                    <p
                      className={
                        message.isOur ? "text-center text-blue-500" : ""
                      }
                    >
                      {`message - ${message.text}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedUser && (
              <div className="mb-6 flex gap-2 items-center absolute bottom-1 w-[50%]">
                <input
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                  }}
                  type="text"
                  id="message"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 w-full focus:border-blue-500 block p-2.5"
                  placeholder="Enter Your message"
                  required
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputMessage}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default App;
