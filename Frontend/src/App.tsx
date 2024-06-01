import axios from "axios";
import { useEffect, useState, useRef } from "react";
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
  const selectedUserRef = useRef<string>(selectedUser);
  const divAfterMessage = useRef<HTMLDivElement | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = () => {
    if (ws && userInfo) {
      const messageData = {
        senderId: userInfo.id,
        recipientId: selectedUser,
        text: inputMessage,
      };
      ws.send(JSON.stringify({ messagedata: messageData }));
      setMessages((prev) => [...prev, { ...messageData, isOur: true }]);
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

  const fetchMessages = async () => {
    if (selectedUser && userInfo) {
      try {
        const res = await axios.get(
          `http://localhost:3000/getmessages/${selectedUser}`,
          { withCredentials: true }
        );
        const fetchedMessages = res.data.messages.map((msg: any) => ({
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          text: msg.message,
          isOur: msg.senderId === userInfo.id,
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    }
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser; // Update the ref whenever selectedUser changes
  }, [selectedUser]);

  useEffect(() => {
    const wsConnection = new WebSocket("ws://localhost:3000");
    setWs(wsConnection);
    wsConnection.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if (data.online) {
        showPeople(data.online);
      } else {
        const { senderId, data: text } = data;
        console.log(typeof senderId);
        console.log("SenderId  " + senderId);
        console.log(typeof selectedUserRef.current);
        console.log("selectedUser   " + selectedUserRef.current);
        Number(senderId) === Number(selectedUserRef.current)
          ? setMessages((prev) => [...prev, { senderId, text, isOur: false }])
          : console.log("no");
      }
    });

    return () => {
      wsConnection.close();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);

  // Ensure the view scrolls to the latest message
  useEffect(() => {
    if (divAfterMessage.current) {
      divAfterMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
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
  }, []);

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (userInfo) {
    return (
      <div className="h-screen flex flex-col">
        <Appbar name={userInfo.name} />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full md:w-[33%] bg-white overflow-y-auto">
            <h1 className="text-center text-3xl my-4 text-blue-400">
              Online Users
            </h1>
            <div className="mt-3 cursor-pointer">
              {Object.keys(onlinePeople).map((Id) => {
                return Id !== String(userInfo.id) ? (
                  <div
                    className={`text-center border-b border-blue-50 py-3 ${
                      selectedUser === Id ? "bg-slate-100 text-blue-500" : ""
                    } `}
                    key={Id}
                    onClick={() => {
                      console.log(typeof Id);
                      console.log(Id);
                      setSelectedUser(Id);
                    }}
                  >
                    {onlinePeople[Id]}
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <div className="w-full md:w-[67%] bg-slate-100 flex flex-col overflow-hidden">
            <h2 className="text-3xl text-center">Chat</h2>
            {!selectedUser && (
              <p className="text-center mt-4">Select a person from the sidebar</p>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedUser &&
                messages.map((message: any, index: any) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${message.isOur ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        message.isOur ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              <div ref={divAfterMessage}></div>
            </div>

            {selectedUser && (
              <div className="flex gap-2 items-center p-4 border-t border-gray-200">
                <input
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                  }}
                  type="text"
                  id="message"
                  className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  placeholder="Enter your message"
                  required
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputMessage}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
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
