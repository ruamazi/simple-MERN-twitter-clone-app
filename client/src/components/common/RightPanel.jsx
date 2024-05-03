import { Link } from "react-router-dom";
import RightPanelSke from "../skeletons/RightPanelSke";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import { useState } from "react";

const RightPanel = () => {
  const [clickedBtn, setClickedBtn] = useState(null);
  const { follow, isPending } = useFollow();

  const { data: suggestUsers, isLoading } = useQuery({
    queryKey: ["suggestUsers"],
    queryFn: async () => {
      try {
        const resp = await fetch("/api/user/sugg");
        const data = await resp.json();
        if (!resp.ok || data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  });

  if (suggestUsers?.length === 0) {
    return <div className="md:w-64 w-0"></div>;
  }
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold mb-3">Who to follow</p>
        <div className="flex flex-col gap-4">
          {isLoading && (
            <>
              <RightPanelSke />
              <RightPanelSke />
              <RightPanelSke />
              <RightPanelSke />
            </>
          )}
          {!isLoading &&
            suggestUsers?.map((user) => (
              <div
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName || user.username}
                    </span>
                    <Link
                      to={`/profile/${user.username}`}
                      className="text-sm text-slate-500"
                    >
                      @{user.username}
                    </Link>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm disabled:bg-zinc-600"
                    onClick={() => {
                      follow(user._id);
                      setClickedBtn(user._id);
                    }}
                    disabled={clickedBtn === user._id && isPending}
                  >
                    Flollow
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
