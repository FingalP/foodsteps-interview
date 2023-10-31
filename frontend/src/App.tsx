import React, { useState, useEffect } from "react";
import "./App.css";
import { UserWithPost, User, Post } from "./types";

function App() {
  const [usersWithPostsData, setUsersWithPostsData] = useState<UserWithPost[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAndCombineUsersAndPostsData();
  }, [searchTerm]);

  async function fetchUsersData(): Promise<User[]> {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users?name_like=${searchTerm}`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error();
      }
      return data;
    } catch (error) {
      throw new Error('Failed to fetch user data');
    }
  }

  async function fetchUsersPostsData(userIds: number[]): Promise<Post[]> {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?${userIds.map((userId) => `userId=${userId}`).join('&')}`);
      const data: Post[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error();
      }

      return userIds.map((userId) => data.filter(post => post.userId === userId).reduce((postWithHighestId, post) => postWithHighestId.id < post.id ? post : postWithHighestId));
    } catch (error) {
      throw new Error('Failed to fetch user posts data');
    }
  }

  async function fetchAndCombineUsersAndPostsData() {
    setIsLoading(true);
    try {
      const usersData = await fetchUsersData();
      const usersPostsData = await fetchUsersPostsData(usersData.map(user => user.id));
      const combinedData = usersData.map((userWithPost) => ({
        user: userWithPost,
        post: usersPostsData.find((userPostsData) => userPostsData.userId === userWithPost.id),
      }));
      setUsersWithPostsData(combinedData);
      setError(null);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        console.error(error);
      }
      setIsLoading(false);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchTerm = formData.get('searchTerm') as string;
    setSearchTerm(searchTerm);
  }

  return (
    <div className="App">
            {isLoading ? (
        <p>Loading...</p> // Display loading message when isLoading is true
      ) : (

        <header className="App-header">
          <form onSubmit={handleSearch}>
            <input type="text" name="searchTerm" />
            <button type="submit">Search</button>
          </form>
          <div>
            {usersWithPostsData.map(({ user, post }) => (
              <div key={user.id}>
                <h2>{user.name}</h2>
                {post ? (
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                ) : (
                  <h3>No post found</h3>
                )}
              </div>
            ))}
          </div>
          {error && <div className="error">{error.message}</div>}
        </header>
      )}
    </div>
  );
}

export default App;
