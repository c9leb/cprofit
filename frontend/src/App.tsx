import { useEffect, useState } from 'react';
import './App.css';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

  // Filter out date-related entries
  const filteredData = Object.entries(data).filter(
    ([key]) => key.toLowerCase() !== 'date'
  );

  return (
    <div className="flex flex-row gap-4 flex-wrap">
      {filteredData.map(([key, value]) => (
        <Card key={key} className="w-64">
          <CardHeader>
            <CardTitle>{key}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default App;