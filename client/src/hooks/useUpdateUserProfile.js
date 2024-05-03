import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUserProfile, isPending: updating } = useMutation({
    mutationFn: async (formData) => {
      try {
        const resp = await fetch("/api/user/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await resp.json();
        if (!resp.ok || data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (err) {
        throw new Error(err);
      }
    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(err.message);
    },
  });

  return { updateUserProfile, updating };
};

export default useUpdateUserProfile;
