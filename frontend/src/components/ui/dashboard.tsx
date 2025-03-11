import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/ui/theme-toggle"
import { DatePickerWithRange } from "@/components/ui/datepicker"
import { LoadingSpinner } from "@/components/ui/loadingspinner"
import { CreditCard, DollarSign, Users } from "lucide-react"
import { Activity } from "lucide-react"
import { DateRange } from 'react-day-picker';
import { useEffect, useState } from 'react';

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface PeriodData {
  from: string,
  to: string,
  Revenue: number;
  Refunds: number;
  Adspend: number;
  COGS: number;
  Profit: number;
  Revenues: { [date: string]: number }; 
}

interface DataType {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
}

function calculatePercentDifference(value1: number, value2: number) {
  const difference = Math.abs(value1 - value2);
  const average = (value1 + value2) / 2;
  const percentDifference = (difference / average) * 100;
  return percentDifference;
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
  }, [dateRange]);
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };


  if (!data || !data.currentPeriod || !data.previousPeriod) {
    return <div>Loading...</div>;
  }
  const formattedData = {
    Revenue: parseFloat(String(data.currentPeriod.Revenue)),
    Refunds: parseFloat(String(data.currentPeriod.Refunds)),
    Adspend: parseFloat(String(data.currentPeriod.Adspend)),
    COGS: parseFloat(String(data.currentPeriod.COGS)),
    Profit: parseFloat(String(data.currentPeriod.Profit)),
  };
  const previousData = {
    Revenue: parseFloat(String(data.previousPeriod.Revenue)),
    Refunds: parseFloat(String(data.previousPeriod.Refunds)),
    Adspend: parseFloat(String(data.previousPeriod.Adspend)),
    COGS: parseFloat(String(data.previousPeriod.COGS)),
    Profit: parseFloat(String(data.previousPeriod.Profit)),
  };
  let revenueDiff = calculatePercentDifference(formattedData?.Revenue, previousData?.Revenue);
  let adspendDiff = calculatePercentDifference(formattedData?.Adspend, previousData?.Adspend);
  let revSign = Math.sign(revenueDiff) === 1 ? "+" : "";
  let adspendSign = Math.sign(adspendDiff) === 1 ? "+" : "";

  const dataForChart = (() => {
    const dates: { [date: string]: number } = {};
    
    
    const startDate = new Date(data.currentPeriod.from);
    const endDate = new Date(data.currentPeriod.to);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().slice(0, 10);
      dates[dateString] = data.currentPeriod.Revenues[dateString] || 0;
    }
  
    return Object.entries(dates)
      .map(([date, revenue]) => ({
        date,
        revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

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
                  <p className="text-xs text-muted-foreground">{revSign}{revenueDiff.toFixed(2)}% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Adspend</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formattedData?.Adspend}</div>
                  <p className="text-xs text-muted-foreground">{adspendSign}{adspendDiff.toFixed(2)}% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total COGS</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formattedData?.COGS}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formattedData?.Profit}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {loading ? (
            <div className="flex justify-center items-center col-span-4 h-32">
              <LoadingSpinner size={48} className="text-gray-500" />
            </div>
          ) : (
            <>
          <Card className = "col-span-4"> 
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>{data.currentPeriod.from} - {data.currentPeriod.to}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={dataForChart}
                  margin={{
                    top: 20,
                    left: 12
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={true}
                    tickMargin={10}
                    axisLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value.slice(5, 10)}
                  />
                  <YAxis
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                    tickFormatter={(value: number) => `$${value.toFixed(2)}`} // Optional: format the Y-axis ticks (e.g., show $)
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="revenue" fill="var(--color-desktop)" radius={8}>
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
            </>
          )}

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    name: "Olivia Martin",
                    email: "olivia.martin@email.com",
                    amount: "+$99.00",
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

