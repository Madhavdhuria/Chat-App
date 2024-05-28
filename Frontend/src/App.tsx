import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [userInfo, setUserInfo]: any = useState(null);
  const [error, setError]: any = useState(null);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000", {
          withCredentials: true,
        });
        setUserInfo(response.data.userInfo);
      } catch (err) {
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
        <h1 className="text-4xl">{`Welcome ${userInfo.name}`}</h1>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default App;
