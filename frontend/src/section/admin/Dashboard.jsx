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

	useEffect(() => {
		loadListMonth()
		loadListRevenueYear()
		loadListRevenueTicket()
		loadListYearTopHost()
		loadListRouter()
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
					</div>
				</div>
			</main>
		</div>
	)
}

export default Dashboard
