import { IoSettingsOutline } from "react-icons/io5";
import Loading from "../components/common/Loading";
import { FaHeart, FaTrash, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

const Notification = () => {
  const [clickedNotif, setClickedNotif] = useState();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const resp = await fetch("/api/notif");
        const data = await resp.json();
        if (!resp.ok || data.error) {
          toast.error(data.error || "Something went wrong");
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  });
  const { mutate: deleteAll } = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`/api/notif/all`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("You deleted all notifications successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: deleteOne, isPending: isDeleting } = useMutation({
    mutationFn: async (notificationId) => {
      const resp = await fetch(`/api/notif/one/${notificationId}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteNotifications = () => {
    deleteAll();
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <Loading size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div
            className="border-b border-gray-700 flex items-center justify-between"
            key={notification._id}
          >
            <div className="flex gap-2 p-4 relative ml-2">
              {notification.type === "follow" && (
                <FaUser className="w-4 h-4 text-primary absolute left-[5px] top-2 rounded-full" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-4 h-4 text-red-500 absolute left-2 top-2" />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "followed you"
                    : "liked your post"}
                </div>
              </Link>
            </div>
            <button
              className="m-5"
              disabled={clickedNotif === notification._id}
            >
              {isDeleting && clickedNotif === notification._id ? (
                <Loading size="sm" />
              ) : (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={() => {
                    setClickedNotif(notification._id);
                    deleteOne(notification._id);
                  }}
                />
              )}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Notification;
