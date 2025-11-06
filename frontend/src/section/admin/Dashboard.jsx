import {Spinner} from '@nextui-org/react'
import {PROVINCES, ROLES} from '@utils/constants'
import {convertStringToNumber} from '@utils/Utils'
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS, // Import LineElement
	Filler,
	Legend,
	LinearScale, // Import PointElement
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js'
import React, {useEffect, useState} from 'react'
import {Bar, Line} from 'react-chartjs-2'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'

// Đăng ký các thành phần Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PointElement, // Đăng ký PointElement
	LineElement, // Đăng ký LineElement
	Filler, // Đăng ký Filler
)

const pieOptions = {
	responsive: true,
	plugins: {
		legend: {
			display: true,
			position: 'right',
			align: 'center', // Căn chỉnh label
			labels: {
				boxWidth: 20, // Kích thước ô màu bên cạnh label
				padding: 15, // Khoảng cách giữa các label
			},
		},
		tooltip: {
			callbacks: {
				label: function (tooltipItem) {
					return tooltipItem.label + ': ' + tooltipItem.raw
				},
			},
		},
	},
}

const Dashboard = () => {
	// Dữ liệu biểu đồ tròn
	const {auth} = useAuth()
	const [dataMonth, setDataMonth] = useState()
	const [dataYearRevenue, setDataYearRevenue] = useState()
	const [topRouter, setTopRoute] = useState()
	const [dataYearTicket, setDataYearTicket] = useState()
	const [dataYearTopRevenue, setDataYearTopRevenue] = useState()

	// New states for host list, homestay list, and chart data
	const [hostList, setHostList] = useState([])
	const [selectedHost, setSelectedHost] = useState(null)
	const [homestayList, setHomestayList] = useState([])
	const [selectedHomestay, setSelectedHomestay] = useState(null)
	const [homestayStats, setHomestayStats] = useState(null)
	const [timeFilter, setTimeFilter] = useState('month') // 'day' | 'week' | 'month'

	useEffect(() => {
		loadListMonth()
		loadListRevenueYear()
		loadListRevenueTicket()
		loadListYearTopHost()
		loadListRouter()
		if (auth?.roles[0] === ROLES.HOST) loadHostListWithHost()
		if (auth?.roles[0] === ROLES.ADMIN) loadHostList()
	}, [auth])

	function loadListMonth() {
		if (!auth) return
		const params = {
			...(auth.roles[0] === ROLES.ADMIN ? {} : {ownerId: auth._id}),
		}
		factories.getStaticsMonth(params).then(res => {
			setDataMonth(res)
		})
	}
	function loadListRouter() {
		factories.getTopRouter().then(res => {
			const routerData = {
				labels: res?.trendingCities?.map((item, index) => `${PROVINCES.find(x => x.id === item.city)?.name} `),
				datasets: [
					{
						label: 'Số chuyến: ',
						data: res?.trendingCities?.map(item => `${item.ticketCount}`),
						backgroundColor: [
							'rgba(255, 99, 132, 0.2)',
							'rgba(255, 159, 64, 0.2)',
							'rgba(153, 102, 255, 0.2)',
							'rgba(255, 159, 64, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(153, 102, 255, 0.2)',
							'rgba(255, 205, 86, 0.2)',
							'rgba(201, 203, 207, 0.2)',
							'rgba(75, 192, 192, 0.2)',
							'rgba(153, 102, 255, 0.2)',
						],
						borderColor: [
							'rgb(255, 99, 132)',
							'rgb(255, 159, 64)',
							'rgb(54, 162, 235)',
							'rgb(255, 205, 86)',
							'rgb(54, 162, 235)',
							'rgb(255, 99, 132)',
							'rgb(75, 192, 192)',
							'rgb(255, 205, 86)',
							'rgb(75, 192, 192)',
							'rgb(255, 159, 64)',
						],
						borderWidth: 1,
					},
				],
			}
			console.log('🚀 ~ factories.getTopRouter ~ routerData:', routerData)
			setTopRoute(routerData)
		})
	}
	function loadListYearTopHost() {
		factories.getStaticsYearTopHost().then(res => {
			const bookingData = {
				labels: res?.topAccommodations.map((item, index) => `[${index + 1}] ${item.name} `),
				datasets: [
					{
						label: 'Doanh Thu',
						data: res?.topAccommodations?.map(item => `${item.totalRevenue}`),
						backgroundColor: [
							'rgba(255, 99, 132, 0.2)',
							'rgba(255, 159, 64, 0.2)',
							'rgba(153, 102, 255, 0.2)',
							'rgba(255, 159, 64, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(153, 102, 255, 0.2)',
							'rgba(255, 205, 86, 0.2)',
							'rgba(201, 203, 207, 0.2)',
							'rgba(75, 192, 192, 0.2)',
							'rgba(153, 102, 255, 0.2)',
						],
						borderColor: [
							'rgb(255, 99, 132)',
							'rgb(255, 159, 64)',
							'rgb(54, 162, 235)',
							'rgb(255, 205, 86)',
							'rgb(255, 99, 132)',
							'rgb(75, 192, 192)',
							'rgb(255, 205, 86)',
							'rgb(75, 192, 192)',
							'rgb(255, 159, 64)',
							'rgb(54, 162, 235)',
						],
						borderWidth: 1,
					},
				],
			}
			setDataYearTopRevenue(bookingData)
		})
	}
	// backgroundColor: [
	//   'rgba(255, 99, 132, 0.2)',
	//   'rgba(255, 159, 64, 0.2)',
	//   'rgba(255, 205, 86, 0.2)',
	//   'rgba(75, 192, 192, 0.2)',
	//   'rgba(54, 162, 235, 0.2)',
	//   'rgba(153, 102, 255, 0.2)',
	//   'rgba(201, 203, 207, 0.2)',
	// ],
	// borderColor: [
	//   'rgb(255, 99, 132)',
	//   'rgb(255, 159, 64)',
	//   'rgb(255, 205, 86)',
	//   'rgb(75, 192, 192)',
	//   'rgb(54, 162, 235)',
	//   'rgb(153, 102, 255)',
	//   'rgb(201, 203, 207)',
	// ],
	function loadListRevenueYear() {
		if (!auth) return
		const params = {
			...(auth.roles[0] === ROLES.ADMIN ? {} : {ownerId: auth._id}),
		}
		factories.getStaticsYearRevenue(params).then(res => {
			// Dữ liệu doanh thu theo tháng
			if (!res.monthlyRevenue) return
			const revenueData = {
				labels: res.monthlyRevenue?.map(item => `Tháng ${item.month}`),
				datasets: [
					{
						label: 'Doanh Thu (VNĐ)',
						data: res.monthlyRevenue.map(item => item.totalRevenue),
						fill: false,
						backgroundColor: 'rgba(75, 192, 192, 1)',
						borderColor: 'rgba(75, 192, 192, 1)',
					},
				],
			}
			setDataYearRevenue(revenueData)
		})
	}
	function loadListRevenueTicket() {
		if (!auth) return
		const params = {
			...(auth.roles[0] === ROLES.ADMIN ? {} : {ownerId: auth._id}),
		}
		factories.getStaticsYearTicket(params).then(res => {
			const bookingData = {
				labels: res.monthlyBooking.map(item => `Tháng ${item.month}`),
				datasets: [
					{
						label: 'Số Lượt Đặt Phòng',
						data: res.monthlyBooking.map(item => item.ticketCount),
						backgroundColor: 'rgba(255, 99, 132, 0.6)',
						borderColor: 'rgba(255, 99, 132, 1)',
						borderWidth: 1,
					},
				],
			}
			setDataYearTicket(bookingData)
		})
	}

	// Load host list for admin
	function loadHostList() {
		factories.getAllHosts().then(res => {
			setHostList(res)
		})
	}

	function loadHostListWithHost() {
		setHostList([auth])
	}

	// Load homestays of selected host
	function loadHomestaysByHost(hostId) {
		factories.getHomestaysByHost({ownerId: hostId}).then(res => {
			setHomestayList(res)
		})
	}

	// Load stats for selected homestay
	function loadHomestayStats(homestayId, filter) {
		factories.getHomestayStats({accommodationId: homestayId, filter}).then(res => {
			setHomestayStats(res.data)
		})
	}

	// Handlers
	const handleHostClick = (host) => {
		setSelectedHost(host)
		loadHomestaysByHost(host._id)
	}

	const handleHomestayClick = (homestay) => {
		setSelectedHomestay(homestay)
		loadHomestayStats(homestay._id, timeFilter)
	}

	const handleTimeFilterChange = (filter) => {
		setTimeFilter(filter)
		if (selectedHomestay) {
			loadHomestayStats(selectedHomestay._id, filter)
		}
	}

	// Close modals
	const closeHostModal = () => {
		setSelectedHost(null)
		setHomestayList([])
	}

	const closeHomestayModal = () => {
		setSelectedHomestay(null)
		setHomestayStats(null)
	}

	return (
		<div className="flex h-screen flex-row">
			<main className="flex w-full flex-1 gap-2 p-4">
				<div className="w-[350px]"></div>
				<div className="top-18 fixed flex h-full flex-grow">
					<div className="h-[490px] w-[350px] rounded-xl border p-4 shadow-xl">
						<p className="mb-2 text-2xl font-bold">Thống kê trong tháng</p>
						<div className="flex flex-col gap-2">
							<div className="p-4">
								<h2 className="text-lg font-semibold">Số Lượt Đặt Phòng</h2>
								{!dataMonth ? (
									<Spinner />
								) : (
									<p className="text-2xl">
										<i className="fas fa-hotel mr-2"></i> {dataMonth?.totalBooking}
									</p>
								)}
							</div>
							<div className="px-4">
								<h2 className="text-lg font-semibold">Số lượt huỷ</h2>
								{!dataMonth ? (
									<Spinner />
								) : (
									<p className="text-2xl">
										<i className="fas fa-exclamation-triangle mr-2"></i> {dataMonth?.totalCancel}
									</p>
								)}
							</div>
							<div className="p-4">
								<h2 className="text-lg font-semibold">Tỷ lệ huỷ đơn</h2>
								{!dataMonth ? (
									<Spinner />
								) : (
									<p className="text-2xl">
										<i className="fas fa-ban mr-2"></i>
										{((dataMonth?.totalCancel / dataMonth?.totalBooking) * 100).toFixed(2)}%
									</p>
								)}
							</div>
							<div className="p-4">
								<h2 className="text-lg font-semibold">Doanh thu đặt phòng</h2>
								{!dataMonth ? (
									<Spinner />
								) : (
									<p className="text-2xl">
										<i className="fas fa-dollar-sign mr-2"></i>
										{convertStringToNumber(dataMonth?.totalRevenue)}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="flex h-fit flex-grow flex-col rounded-lg border p-4 shadow-lg">
					<p className="mb-2 text-2xl font-bold">Biểu đồ năm</p>
					<div className="flex flex-col gap-10">
						<div className="flex flex-row gap-4">
							<div className="flex-1 rounded-lg border bg-white p-4 shadow">
								<h2 className="text-lg font-semibold">Số Lượt Đặt Phòng Theo Tháng</h2>
								{!dataYearTicket ? (
									<Spinner />
								) : (
									<Bar
										data={dataYearTicket}
										options={{responsive: true}}
									/>
								)}
							</div>
							<div className="flex-1 rounded-lg border bg-white p-4 shadow">
								<h2 className="text-lg font-semibold">Xu Hướng Doanh Thu Theo Tháng</h2>
								{!dataYearRevenue ? (
									<Spinner />
								) : (
									<Line
										data={dataYearRevenue}
										options={{responsive: true}}
									/>
								)}
							</div>
						</div>
						<div className="flex flex-row gap-4">
							{auth?.roles[0] === ROLES.ADMIN && (
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<h2 className="text-lg font-semibold">Top địa điểm phổ biến</h2>
									{!topRouter ? (
										<Spinner />
									) : (
										<Bar
											data={topRouter}
											options={{responsive: true}}
										/>
									)}
								</div>
							)}
							{auth?.roles[0] === ROLES.ADMIN && (
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<h2 className="text-lg font-semibold">Top 5 khách sạn doanh thu cao nhất</h2>
									{!dataYearTopRevenue ? (
										<Spinner />
									) : (
										<Bar
											data={dataYearTopRevenue}
											options={{responsive: true}}
										/>
									)}
								</div>
							)}
						</div>
						{auth?.roles[0] === ROLES.ADMIN && (
							<div className="rounded-lg border bg-white p-4 shadow">
								<h2 className="text-lg font-semibold mb-2">Danh sách Host</h2>
								{hostList.length === 0 ? (
									<Spinner />
								) : (
									<ul className="max-h-48 overflow-y-auto">
										{hostList.map(host => (
											<li
												key={host._id}
												className="cursor-pointer p-2 hover:bg-gray-100 rounded"
												onClick={() => handleHostClick(host)}
											>
												{host.name} - {host.email}
											</li>
										))}
									</ul>
								)}
							</div>
						)}

						{auth?.roles[0] === ROLES.HOST && (
							<div className="rounded-lg border bg-white p-4 shadow">
								<h2 className="text-lg font-semibold mb-2">Danh sách Host</h2>
								{hostList.length === 0 ? (
									<Spinner />
								) : (
									<ul className="max-h-48 overflow-y-auto">
										{hostList.map(host => (
											<li
												key={host._id}
												className="cursor-pointer p-2 hover:bg-gray-100 rounded"
												onClick={() => handleHostClick(host)}
											>
												{host.name} - {host.email}
											</li>
										))}
									</ul>
								)}
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Host Homestays Modal */}
			{selectedHost && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold">Homestays của {selectedHost.name}</h3>
							<button onClick={closeHostModal} className="text-gray-500 hover:text-black">✕</button>
						</div>
						{homestayList.length === 0 ? (
							<Spinner />
						) : (
							<ul>
								{homestayList.map(homestay => (
									<li
										key={homestay._id}
										className="cursor-pointer p-2 hover:bg-gray-100 rounded"
										onClick={() => handleHomestayClick(homestay)}
									>
										{homestay.name}
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			)}

			{/* Homestay Stats Modal */}
			{selectedHomestay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold">Thống kê {selectedHomestay.name}</h3>
							<button onClick={closeHomestayModal} className="text-gray-500 hover:text-black">✕</button>
						</div>
						<div className="mb-4 flex gap-2">
							<button
								className={`px-3 py-1 rounded ${timeFilter === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
								onClick={() => handleTimeFilterChange('day')}
							>
								Ngày
							</button>
							<button
								className={`px-3 py-1 rounded ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
								onClick={() => handleTimeFilterChange('week')}
							>
								Tuần
							</button>
							<button
								className={`px-3 py-1 rounded ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
								onClick={() => handleTimeFilterChange('month')}
							>
								Tháng
							</button>
						</div>
						{!homestayStats ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-4">
								<div className="flex-1 rounded border p-3">
									<h4 className="font-semibold">Doanh thu</h4>
									<Line
										data={{
											labels: homestayStats.revenue.map(item => item.label),
											datasets: [{
												label: 'Doanh thu (VNĐ)',
												data: homestayStats.revenue.map(item => item.value),
												backgroundColor: 'rgba(75,192,192,1)',
												borderColor: 'rgba(75,192,192,1)',
												fill: false,
											}]
										}}
										options={{responsive: true}}
									/>
								</div>
								<div className="flex-1 rounded border p-3">
									<h4 className="font-semibold">Lượt đặt</h4>
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
										options={{responsive: true}}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Dashboard
