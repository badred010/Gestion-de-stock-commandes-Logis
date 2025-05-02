import { Col, Row } from 'antd';
import HistoryTable from '../components/tables/HistoryTable';
import {
  useDailySaleQuery,
  useMonthlySaleQuery,
  useWeeklySaleQuery,
  useYearlySaleQuery,
} from '../redux/features/management/saleApi';

const SaleHistoryPage = () => {
  const { data: yearlyData, isFetching: isYearlyDataFetching } = useYearlySaleQuery(undefined);
  const { data: monthlyData, isFetching: isMonthlyDataFetching } = useMonthlySaleQuery(undefined);
  const { data: dailySale, isFetching: isDailySaleFetching } = useDailySaleQuery(undefined);
  const { data: weeklySale, isFetching: isWeeklySaleFetching } = useWeeklySaleQuery(undefined);

  return (
    <Row
      style={{
        maxHeight: 'calc(100vh - 5rem)',
        overflow: 'auto',
        paddingRight: '.5rem',
      }}
    >
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Ventes annuelles</h1>
          <HistoryTable data={yearlyData} isFetching={isYearlyDataFetching} />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Ventes mensuelles</h1>
          <HistoryTable data={monthlyData} isFetching={isMonthlyDataFetching} />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Ventes hebdomadaires</h1>
          <HistoryTable data={weeklySale} isFetching={isWeeklySaleFetching} />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Ventes quotidiennes</h1>
          <HistoryTable data={dailySale} isFetching={isDailySaleFetching} />
        </div>
      </Col>
    </Row>
  );
};

export default SaleHistoryPage;
