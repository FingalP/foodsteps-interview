import React, { useState, useEffect, FormEvent } from "react";
import logo from "./logo.svg";
import "./App.css";

interface RawCoordinates {
  lat: string;
  lng: string;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: RawCoordinates;
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

interface Post {
  id: number;
  userId: number;
  body: string;
}

interface UserWithPost {
  user: User;
  post: Post | undefined;
}

function App() {
  const [usersData, setUsersData] = useState<UserWithPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAndCombineUsersAndPostsData();
  }, [searchTerm]);

  async function fetchUsersData(): Promise<User[]> {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
      const data = await response.json();
      return data.filter((user: User) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async function fetchUsersPostsData(userIds: number[]): Promise<Post[]> {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?${userIds.map((userId) => `userId=${userId}`).join('&')}`);
      const data: Post[] = await response.json();
      return userIds.map((userId) => data.filter(post => post.userId === userId).reduce((postWithHighestId, post) => postWithHighestId.id < post.id ? post : postWithHighestId));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async function fetchAndCombineUsersAndPostsData() {
    try {
      const usersData = await fetchUsersData();
      const usersPostsData = await fetchUsersPostsData(usersData.map(user => user.id));
      const combinedData = usersData.map((userData) => ({
        user: userData,
        post: usersPostsData.find((userPostsData) => userPostsData.userId === userData.id),
      }));
      setUsersData(combinedData);
    } catch (error) {
      console.error(error);
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchTerm = formData.get('searchTerm') as string;
    setSearchTerm(searchTerm);
  }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSearch}>
          <input type="text" name="searchTerm" />
          <button type="submit">Search</button>
        </form>
        <div>
          {usersData.map((user) => (
            <div key={user.user.id}>
              <h2>{user.user.name}</h2>
              <p>{user.post?.body}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
