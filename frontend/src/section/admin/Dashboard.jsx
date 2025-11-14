import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Import your statistics factory
// import { statisticsFactory } from '../../factory/statistics.factory';

// Mock factory for demo - replace with real import
import { statisticsFactory } from '../../factory/statistics.factory';
import {useAuth} from '../../context/AuthContext'
import { ROLES } from '@utils/constants';

const Dashboard = () => {
  const {auth} = useAuth()
  const [dataMonth, setDataMonth] = useState(null);
  const [dataYearRevenue, setDataYearRevenue] = useState(null);
  const [topRouter, setTopRoute] = useState(null);
  const [dataYearTicket, setDataYearTicket] = useState(null);
  const [dataYearTopRevenue, setDataYearTopRevenue] = useState(null);
  
  const [hostList, setHostList] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [homestayList, setHomestayList] = useState([]);
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [homestayStats, setHomestayStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [loading, setLoading] = useState({
    month: false,
    yearRevenue: false,
    yearTicket: false,
    topRouter: false,
    topHost: false,
    hosts: false,
    homestays: false,
    homestayStats: false
  });

  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadMonthData();
  }, [selectedMonth]);

  useEffect(() => {
    loadYearData();
  }, [selectedYear]);

  const loadAllData = async () => {
    await Promise.all([
      loadMonthData(),
      loadYearData(),
      loadHostList()
    ]);
  };

  const loadMonthData = async () => {
    setLoading(prev => ({ ...prev, month: true }));
    try {
      const [year, month] = selectedMonth.split('-');
      const response = await statisticsFactory.getStaticsMonth({
        month: parseInt(month),
        year: parseInt(year)
      });
      // response is already the data object from axios interceptor
      setDataMonth(response);
      setError(null);
    } catch (err) {
      console.error('Error loading month data:', err);
      setError('Không thể tải dữ liệu tháng');
    } finally {
      setLoading(prev => ({ ...prev, month: false }));
    }
  };

  const loadYearData = async () => {
    // Load year revenue
    setLoading(prev => ({ ...prev, yearRevenue: true }));
    try {
      const response = await statisticsFactory.getStaticsYearRevenue({
        year: parseInt(selectedYear)
      });
      // response is already the data from interceptor
      if (response && response.monthlyRevenue) {
        setDataYearRevenue({
          labels: response.monthlyRevenue.map(item => `Tháng ${item.month}`),
          datasets: [{
            label: 'Doanh Thu (VNĐ)',
            data: response.monthlyRevenue.map(item => item.totalRevenue),
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 1)',
            borderColor: 'rgba(75, 192, 192, 1)',
          }]
        });
      }
    } catch (err) {
      console.error('Error loading year revenue:', err);
    } finally {
      setLoading(prev => ({ ...prev, yearRevenue: false }));
    }

    // Load year tickets
    setLoading(prev => ({ ...prev, yearTicket: true }));
    try {
      const response = await statisticsFactory.getStaticsYearTicket({
        year: parseInt(selectedYear)
      });
      if (response && response.monthlyBooking) {
        setDataYearTicket({
          labels: response.monthlyBooking.map(item => `Tháng ${item.month}`),
          datasets: [{
            label: 'Số Lượt Đặt Phòng',
            data: response.monthlyBooking.map(item => item.ticketCount),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }]
        });
      }
    } catch (err) {
      console.error('Error loading year tickets:', err);
    } finally {
      setLoading(prev => ({ ...prev, yearTicket: false }));
    }

    // Load top router
    setLoading(prev => ({ ...prev, topRouter: true }));
    try {
      const response = await statisticsFactory.getTopRouter({
        year: parseInt(selectedYear)
      });
      if (response && response.trendingCities) {
        setTopRoute({
          labels: response.trendingCities.map(item => item.name),
          datasets: [{
            label: 'Số chuyến',
            data: response.trendingCities.map(item => item.ticketCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
            ],
            borderWidth: 1,
          }]
        });
      }
    } catch (err) {
      console.error('Error loading top router:', err);
    } finally {
      setLoading(prev => ({ ...prev, topRouter: false }));
    }

    // Load top hosts
    setLoading(prev => ({ ...prev, topHost: true }));
    try {
      const response = await statisticsFactory.getStaticsYearTopHost({
        year: parseInt(selectedYear)
      });
      if (response && response.topAccommodations) {
        setDataYearTopRevenue({
          labels: response.topAccommodations.map((item, i) => `[${i+1}] ${item.name}`),
          datasets: [{
            label: 'Doanh Thu',
            data: response.topAccommodations.map(item => item.totalRevenue),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
            ],
            borderWidth: 1,
          }]
        });
      }
    } catch (err) {
      console.error('Error loading top hosts:', err);
    } finally {
      setLoading(prev => ({ ...prev, topHost: false }));
    }
  };

  const loadHostList = async () => {
    setLoading(prev => ({ ...prev, hosts: true }));
    try {
      const response = await statisticsFactory.getAllHosts();
      if(auth.roles[0] === ROLES.HOST) {
        response.filter(item => item._id === auth._id);
      }
        
      setHostList(Array.isArray(response) ? response : []);
      
    } catch (err) {
      console.error('Error loading hosts:', err);
    } finally {
      setLoading(prev => ({ ...prev, hosts: false }));
    }
  };

  const handleHostClick = async (host) => {
    setSelectedHost(host);
    setHomestayList([]);
    setLoading(prev => ({ ...prev, homestays: true }));
    
    try {
      const response = await statisticsFactory.getHomestaysByHost({
        ownerId: host._id
      });
      // response is already the array from interceptor
      setHomestayList(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading homestays:', err);
    } finally {
      setLoading(prev => ({ ...prev, homestays: false }));
    }
  };

  const handleHomestayClick = (homestay) => {
    setSelectedHomestay(homestay);
    loadHomestayStats(homestay._id, timeFilter, selectedDate);
  };

  const loadHomestayStats = async (accommodationId, filter, date) => {
    setLoading(prev => ({ ...prev, homestayStats: true }));
    try {
      const response = await statisticsFactory.getHomestayStats({
        accommodationId,
        filter,
        date
      });
      // response is already the data object from interceptor
      console.log('Response:', response.data);
      setHomestayStats(response.data);
    } catch (err) {
      console.error('Error loading homestay stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, homestayStats: false }));
    }
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    if (selectedHomestay) {
      loadHomestayStats(selectedHomestay._id, filter, selectedDate);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (selectedHomestay) {
      loadHomestayStats(selectedHomestay._id, timeFilter, newDate);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const closeHostModal = () => {
    setSelectedHost(null);
    setHomestayList([]);
  };

  const closeHomestayModal = () => {
    setSelectedHomestay(null);
    setHomestayStats(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard Thống Kê</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Date Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Bộ lọc thời gian</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chọn tháng:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chọn năm:</label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chọn ngày cụ thể:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Thống kê tháng {selectedMonth}</h2>
              {loading.month ? (
                <div className="flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
              ) : dataMonth ? (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-sm text-gray-600">Số Lượt Đặt Phòng</h3>
                    <p className="text-2xl font-bold text-blue-600">{dataMonth.totalBooking}</p>
                  </div>
                  <div className="border-b pb-3">
                    <h3 className="text-sm text-gray-600">Số lượt huỷ</h3>
                    <p className="text-2xl font-bold text-red-600">{dataMonth.totalCancel}</p>
                  </div>
                  <div className="border-b pb-3">
                    <h3 className="text-sm text-gray-600">Tỷ lệ huỷ đơn</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {dataMonth.totalBooking > 0 ? ((dataMonth.totalCancel / dataMonth.totalBooking) * 100).toFixed(2) : 0}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-600">Doanh thu</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(dataMonth.totalRevenue)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Số Lượt Đặt Phòng Theo Tháng</h2>
                {loading.yearTicket ? (
                  <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                ) : dataYearTicket ? (
                  <Bar data={dataYearTicket} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500">Không có dữ liệu</p>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Xu Hướng Doanh Thu Theo Tháng</h2>
                {loading.yearRevenue ? (
                  <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                ) : dataYearRevenue ? (
                  <Line data={dataYearRevenue} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500">Không có dữ liệu</p>
                )}
              </div>
            </div>
                
            {auth.roles[0] === ROLES.ADMIN && 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Top địa điểm phổ biến</h2>
                {loading.topRouter ? (
                  <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                ) : topRouter ? (
                  <Bar data={topRouter} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500">Không có dữ liệu</p>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Top 5 khách sạn doanh thu cao nhất</h2>
                {loading.topHost ? (
                  <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                ) : dataYearTopRevenue ? (
                  <Bar data={dataYearTopRevenue} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500">Không có dữ liệu</p>
                )}
              </div>
            </div>
            }      

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Danh sách Host</h2>
              {loading.hosts ? (
                <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
              ) : hostList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {hostList.map(host => (
                    <div
                      key={host._id}
                      className="cursor-pointer p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                      onClick={() => handleHostClick(host)}
                    >
                      <p className="font-semibold">{host.name}</p>
                      <p className="text-sm text-gray-600">{host.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có host nào</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Host Homestays Modal */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Homestays của {selectedHost.name}</h3>
              <button onClick={closeHostModal} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            {loading.homestays ? (
              <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
            ) : homestayList.length > 0 ? (
              <div className="space-y-2">
                {homestayList.map(homestay => (
                  <div
                    key={homestay._id}
                    className="cursor-pointer p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                    onClick={() => handleHomestayClick(homestay)}
                  >
                    {homestay.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Không có homestay nào</p>
            )}
          </div>
        </div>
      )}

      {/* Homestay Stats Modal */}
      {selectedHomestay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Thống kê {selectedHomestay.name}</h3>
              <button onClick={closeHomestayModal} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition ${timeFilter === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleTimeFilterChange('day')}
                >
                  Ngày
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleTimeFilterChange('week')}
                >
                  Tuần
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => handleTimeFilterChange('month')}
                >
                  Tháng
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Chọn ngày để xem chi tiết:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading.homestayStats ? (
              <div className="flex justify-center py-12"><div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
            ) : homestayStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Doanh thu</h4>
                  <Line
                    data={{
                      labels: homestayStats.revenue.map(item => item.label),
                      datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: homestayStats.revenue.map(item => item.value),
                        backgroundColor: 'rgba(75,192,192,0.2)',
                        borderColor: 'rgba(75,192,192,1)',
                        fill: true,
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: true }}
                  />
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Lượt đặt</h4>
                  <Bar
                    data={{
                      labels: homestayStats.booking.map(item => item.label),
                      datasets: [{
                        label: 'Lượt đặt',
                        data: homestayStats.booking.map(item => item.value),
                        backgroundColor: 'rgba(255,99,132,0.6)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: true }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Không có dữ liệu</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;