import { Flex } from 'antd';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDailySaleQuery } from '../../redux/features/management/saleApi';
import Loader from '../Loader';

interface SaleItem {
  day: number;
  month: number;
  year: number;
  totalRevenue: number;
  totalQuantity: number;
}

interface ChartDataItem {
  day: string;
  revenue: number;
  quantity: number;
}

export default function WeeklyChart() {
  const { data: dailyData, isLoading } = useDailySaleQuery(undefined);

  if (isLoading)
    return (
      <Flex justify="center" align="center">
        <Loader />
      </Flex>
    );

  const frenchWeekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const weekData: Record<string, { revenue: number; quantity: number }> = {
    Lun: { revenue: 0, quantity: 0 },
    Mar: { revenue: 0, quantity: 0 },
    Mer: { revenue: 0, quantity: 0 },
    Jeu: { revenue: 0, quantity: 0 },
    Ven: { revenue: 0, quantity: 0 },
    Sam: { revenue: 0, quantity: 0 },
    Dim: { revenue: 0, quantity: 0 },
  };

  (dailyData?.data as SaleItem[])?.forEach((item: SaleItem) => {
    const date = new Date(item.year, item.month - 1, item.day);
    const weekdayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
    const frenchDay = frenchWeekDays[(weekdayIndex + 6) % 7]; // Monday-based

    if (weekData[frenchDay]) {
      weekData[frenchDay].revenue += item.totalRevenue;
      weekData[frenchDay].quantity += item.totalQuantity;
    }
  });

  const chartData: ChartDataItem[] = frenchWeekDays.map((day) => ({
    day,
    revenue: weekData[day].revenue,
    quantity: weekData[day].quantity,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'revenue') {
              return [`${value} MAD`, 'Revenu'];
            } else if (name === 'Quantité') {
              return [`${value} pcs`, 'Quantité'];
            }
            return [value, name]; // fallback
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#00C49F"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="revenue"
        />
        <Area
          type="monotone"
          dataKey="quantity"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorQuantity)"
          name="Quantité"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
