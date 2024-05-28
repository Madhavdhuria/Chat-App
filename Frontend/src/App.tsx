import axios from "axios";
import { useEffect, useState } from "react";
import Appbar from "./components/Appbar";

function App() {
  const [userInfo, setUserInfo]:any|string = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        setUserInfo(response.data.userInfo);
      } catch (err:any) {
        setError(err);
      }
    };
    getInfo();
  }, []);

  if (error) {
    return <div>Something went wrong</div>;
  }

  if (userInfo) {
    return (
      <div>
        <Appbar name={userInfo.name}/>
        <h1 className="text-4xl">{`Welcome ${userInfo.name}`}</h1>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default App;
