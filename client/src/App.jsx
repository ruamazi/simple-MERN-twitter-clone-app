import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import Notification from "./pages/Notification";
import Profile from "./pages/Profile";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "./components/common/Loading";

function App() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const resp = await fetch("/api/auth");
        const data = await resp.json();
        if (!resp.ok || data.error) {
          return null;
        }
        return data;
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className=" h-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="flex max-w-6xl mx-auto">
        {currentUser && <Sidebar currentUser={currentUser} />}
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Home /> : <Navigate to={"/sign-in"} />}
          />
          <Route
            path="/sign-in"
            element={!currentUser ? <Signin /> : <Navigate to={"/"} />}
          />
          <Route
            path="/sign-up"
            element={!currentUser ? <Signup /> : <Navigate to={"/"} />}
          />
          <Route
            path="/notifications"
            element={
              currentUser ? <Notification /> : <Navigate to={"/sign-in"} />
            }
          />
          <Route
            path="/profile/:username"
            element={
              currentUser ? (
                <Profile currentUser={currentUser} />
              ) : (
                <Navigate to={"/sign-in"} />
              )
            }
          />
        </Routes>
        {currentUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
