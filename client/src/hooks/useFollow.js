import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryclient = useQueryClient();
  const {
    mutate: follow,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const resp = await fetch(`/api/user/follow/${userId}`);
        const data = await resp.json();
        if (!resp.ok || data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (err) {
        console.log(err);
        throw new Error("Something went wrong");
      }
    },
    onSuccess: () => {
      Promise.all([
        queryclient.invalidateQueries({ queryKey: ["suggestUsers"] }),
        queryclient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
    onError: () => {
      toast.error(error.message);
    },
  });
  return { follow, isPending };
};

export default useFollow;
