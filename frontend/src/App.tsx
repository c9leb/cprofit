import { useEffect, useState } from 'react';
import './App.css';
interface DataType {
  [key: string]: string | number;
}

function App() {
  const [data, setData] = useState<DataType | null>(null);

  useEffect(() => {
    fetch('https://cprofit-backend.vercel.app/')
      .then(response => response.json())
      .then((data: DataType) => setData(data));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="element">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>{key}: {value}</div>
      ))}
    </div>
  );
}

export default App;