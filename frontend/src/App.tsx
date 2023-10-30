import React, { useState, useEffect, FormEvent } from "react";
import logo from "./logo.svg";
import "./App.css";

interface Item {
  id: number;
  title: string;
  body: string;
}

function App() {
  const [data, setData] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  function fetchData() {
    fetch(`https://api.example.com/data?search=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error(error));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchData();
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
      </header>
      <div>
        {data.map((item) => (
          <div key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
