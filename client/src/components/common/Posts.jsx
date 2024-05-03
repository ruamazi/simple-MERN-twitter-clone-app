import { useEffect } from "react";
import PostSke from "../skeletons/PostSke";
import Post from "./Post";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username }) => {
  // const getPostEndPoint = () => {
  //   switch (feedType) {
  //     case "forYou":
  //       return "/api/post/all";
  //     case "following":
  //       return "/api/post/following";
  //     case "posts":
  //       return `/api/post/user/${username}`;
  //     case "likes":
  //       return `/api/post/liked/${username}`;
  //     default:
  //       return "/api/post/all";
  //   }
  // };
  // const POST_ENDPOINT = getPostEndPoint();
  const POST_ENDPOINT =
    feedType === "forYou"
      ? "/api/post/all"
      : feedType === "posts"
      ? `/api/post/user/${username}`
      : feedType === "likes"
      ? `/api/post/liked/${username}`
      : "/api/post/following";

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const resp = await fetch(POST_ENDPOINT);
        const data = await resp.json();
        if (!resp.ok || data.error) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSke />
          <PostSke />
          <PostSke />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
