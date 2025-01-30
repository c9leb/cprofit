import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="element">
      {Object.entries(data).map(([key, value], index) => (
        <div key={index}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
}

export default App;