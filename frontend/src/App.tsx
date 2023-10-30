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

function App() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsersData();
  }, [searchTerm]);

  function fetchUsersData() {
    fetch(`https://jsonplaceholder.typicode.com/users`)
      .then((response) => response.json())
      .then((data) => setUsersData(data))
      .catch((error) => console.error(error));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchUsersData();
  }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div>
          {usersData.map((user) => (
            <div key={user.id}>
              <h2>{user.name}</h2>
              <p>{user.username}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
