import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ui/theme-toggle"
import { DatePickerWithRange } from "@/components/ui/datepicker"
import { LoadingSpinner } from "@/components/ui/loadingspinner"
import { CreditCard, DollarSign, Users } from "lucide-react"
import { Activity } from "lucide-react"
import { DateRange } from 'react-day-picker';
import { useEffect, useState } from 'react';

interface DataType {
  [key: string]: string | number;
}

export default function Dashboard() {

  const [data, setData] = useState<DataType | null>(null);
  const todayPST = new Date().toLocaleString('en-US', { 
    timeZone: 'America/Los_Angeles' 
  });
  
  const today = new Date(todayPST).toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`https://cprofit-backend.vercel.app/?from=${today}&to=${today}`)
      .then(response => response.json())
      .then((data: DataType) => setData(data));
  }, []);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const fromDate = dateRange.from.toISOString().slice(0, 10);
      const toDate = dateRange.to.toISOString().slice(0, 10);

      setLoading(true);
      fetch(`https://cprofit-backend.vercel.app/?from=${fromDate}&to=${toDate}`)
        .then(response => response.json())
        .then((data: DataType) => setData(data))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dateRange]); // Dependency array should include dateRange
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };


  if (!data) {
    return <div>Loading...</div>;
  }
  const formattedData = {
    Revenue: parseFloat(String(data.currentPeriod.Revenue)),
    Refunds: parseFloat(String(data.currentPeriod.Refunds)),
    Adspend: parseFloat(String(data.currentPeriod.Adspend)),
    COGS: parseFloat(String(data.currentPeriod.COGS)),
    Profit: parseFloat(String(data.currentPeriod.Profit)),
  };
  const formattedData = {
    Revenue: parseFloat(String(data.currentPeriod.Revenue)),
    Refunds: parseFloat(String(data.currentPeriod.Refunds)),
    Adspend: parseFloat(String(data.currentPeriod.Adspend)),
    COGS: parseFloat(String(data.currentPeriod.COGS)),
    Profit: parseFloat(String(data.currentPeriod.Profit)),
  };
  

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="border-b font-sans">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://i.imgur.com/QBwjKdi.png"
                alt="Profile"
              />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <span className="font-sans">koriworld</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <DatePickerWithRange 
              onDateChange={handleDateChange}
              initialDateRange={{
                from: new Date(),
                to: new Date()
              }}
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {loading ? (
            <div className="flex justify-center items-center col-span-4 h-32">
              <LoadingSpinner size={48} className="text-gray-500" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formattedData?.Revenue}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Adspend</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formattedData?.Adspend}</div>
                  <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total COGS</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formattedData?.COGS}</div>
                  <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formattedData?.Profit}</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {/* Bar chart would go here - using a placeholder div for now */}
                <div className="h-full w-full bg-muted/10 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <p className="text-sm text-muted-foreground">You made 265 sales this month.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    name: "Olivia Martin",
                    email: "olivia.martin@email.com",
                    amount: "+$1,999.00",
                  },
                  {
                    name: "Jackson Lee",
                    email: "jackson.lee@email.com",
                    amount: "+$39.00",
                  },
                  {
                    name: "Isabella Nguyen",
                    email: "isabella.nguyen@email.com",
                    amount: "+$299.00",
                  },
                  {
                    name: "William Kim",
                    email: "will@email.com",
                    amount: "+$99.00",
                  },
                  {
                    name: "Sofia Davis",
                    email: "sofia.davis@email.com",
                    amount: "+$39.00",
                  },
                ].map((sale) => (
                  <div key={sale.email} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{sale.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{sale.name}</p>
                      <p className="text-sm text-muted-foreground">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

