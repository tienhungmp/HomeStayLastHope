import {NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper} from '@chakra-ui/react'
import {getLocalTimeZone, parseDate, today} from '@internationalized/date'
import {
	Avatar,
	Button,
	DateRangePicker,
	Divider,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectItem,
	Switch,
} from '@nextui-org/react'
import {cn, getDate} from '@utils/Utils'
import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import useRouter from '../../hook/use-router'
import {RouterPath} from '../../router/RouterPath'
import {PROVINCES, ROLES} from '../../utils/constants'
import LoginModal from './Login'
import RegisterModal from './Register'

const initToday = new Date()
const defaultRange = {
	start: parseDate(getDate(initToday, 1)),
	end: parseDate(getDate(initToday.setDate(initToday.getDate() + 7), 1)),
}

function Header({showText, showSearch = false}) {
	const navigate = useNavigate()

	const {auth, logout} = useAuth()
	const [destination, setDestination] = useState('21')
	const [roomCount, setRoomCount] = useState(1)
	const [personCount, setPersonCount] = useState(2)
	const [havePet, setHavePet] = useState(false)
	const {onOpen} = useModalCommon()
	const [dateRange, setDateRange] = useState(defaultRange)

	const router = useRouter()
	const {city} = router.getAll()

	useEffect(() => {
		if (city) {
			setDestination(city)
		}
	}, [city])
	function handleSearch() {
		const newParams = {
			city: destination,
			fromDate: dateRange.start,
			toDate: dateRange.end,
			roomQuantity: roomCount,
			capacity: personCount,
			isWithPet: Boolean(havePet),
			pricePerNight: '100000, 2000000',
		}
		router.push({
			pathname: RouterPath.SEARCH,
			params: newParams,
		})
	}

	const openLogin = () => {
		onOpen({
			view: <LoginModal />,
			title: 'Đăng nhập',
			showFooter: false,
		})
	}
	function handleLogout() {
		logout()
	}
	function openRegister() {
		onOpen({
			view: <RegisterModal />,
			title: 'Đăng ký',
			showFooter: false,
		})
	}

	return (
		<div className={cn('relative rounded-ee-xl rounded-es-xl', !showText && !showSearch && 'rounded-none')}>
			{/* Luxury Banner */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute left-0 top-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
			</div>

			<div className="relative z-10 m-auto w-full max-w-[80%] 2xl:max-w-[80%]">
				<header className="pt-5 text-white">
					<div className="container mx-auto flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link
								to="/"
								className="text-3xl font-extrabold tracking-wide drop-shadow-lg"
							>
								LuxeStay
							</Link>
						</div>
						<div className="flex items-center space-x-3">
							{!auth && (
								<Button
									variant="shadow"
									color="primary"
									className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
									onClick={() =>
										router.push({
											pathname: RouterPath.REGISTER_HOST,
										})
									}
								>
									Trở thành chủ nhà
								</Button>
							)}

							{auth ? (
								<>
									<Dropdown>
										<DropdownTrigger>
											<Button
												variant="light"
												className="rounded-full border-none bg-white/10 px-4 py-2 backdrop-blur-sm hover:bg-white/20"
											>
												<Avatar
													src={auth.profilePictureUrl}
													className="h-7 w-7 ring-2 ring-white/50"
												/>
												<p className="text-white">{auth.fullName}</p>
												<i className="fa fa-chevron-down text-xs text-white/80"></i>
											</Button>
										</DropdownTrigger>
										{auth.roles[0] === ROLES.USER || (auth.roles[0] === ROLES.HOST && auth.isRequestBusOwner === false) ? (
											<DropdownMenu aria-label="Static Actions" className="rounded-xl shadow-2xl">
												<DropdownItem
													key="profile"
													onClick={() => navigate('/profile')}
													className="rounded-lg text-gray-800 hover:bg-blue-50"
												>
													<i className="fas fa-user mr-3 text-blue-600"></i>
													<span>Thông tin tài khoản</span>
												</DropdownItem>
												<DropdownItem
													key="ticket"
													onClick={() => navigate('/my-ticket')}
													className="rounded-lg text-gray-800 hover:bg-blue-50"
												>
													<i className="fas fa-bed mr-3 text-blue-600"></i>
													<span>Phòng của tôi</span>
												</DropdownItem>
												<DropdownItem
													onClick={logout}
													className="rounded-lg text-red-600 hover:bg-red-50"
												>
													<i className="fas fa-sign-out-alt mr-3"></i>
													<span>Đăng xuất</span>
												</DropdownItem>
											</DropdownMenu>
										) : (
											<DropdownMenu aria-label="Static Actions" className="rounded-xl shadow-2xl">
												<DropdownItem
													key="profile"
													onClick={() => navigate('/profile')}
													className="rounded-lg text-gray-800 hover:bg-blue-50"
												>
													<i className="fas fa-user mr-3 text-blue-600"></i>
													<span>Thông tin tài khoản</span>
												</DropdownItem>
												<DropdownItem
													key="review"
													onClick={() => navigate('/admin')}
													className="rounded-lg text-gray-800 hover:bg-blue-50"
												>
													<i className="fas fa-cog mr-3 text-blue-600"></i>
													<span>Quản lý hệ thống</span>
												</DropdownItem>
												<DropdownItem
													onClick={logout}
													className="rounded-lg text-red-600 hover:bg-red-50"
												>
													<i className="fas fa-sign-out-alt mr-3"></i>
													<span>Đăng xuất</span>
												</DropdownItem>
											</DropdownMenu>
										)}
									</Dropdown>
								</>
							) : (
								<>
									<Button
										variant="shadow"
										color="primary"
										className="rounded-full bg-white px-5 py-2 font-semibold text-blue-700 shadow-lg transition hover:bg-gray-100"
										onClick={openRegister}
									>
										Đăng ký
									</Button>
									<Button
										variant="shadow"
										color="primary"
										className="rounded-full bg-white/10 px-5 py-2 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
										onClick={openLogin}
									>
										Đăng nhập
									</Button>
								</>
							)}
						</div>
					</div>
				</header>

				<main className={cn('text-left text-white')}>
					{showText && (
						<div className="mx-auto max-w-4xl pt-12 pb-20 text-center">
							<h1 className="text-5xl font-extrabold tracking-tight drop-shadow-xl sm:text-6xl">
								Kỳ nghỉ trong mơ bắt đầu từ đây
							</h1>
							<p className="mt-4 text-xl font-light text-white/90 drop-shadow-lg">
								Khám phá những chỗ nghỉ sang trọng, tiện nghi và đẳng cấp nhất
							</p>
						</div>
					)}
					{showSearch && (
						<div className="bottom-[-28px] left-1/2 w-full -translate-x-1/2 xl:absolute xl:w-[80%] 2xl:w-[80%]">
							<div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/90 p-3 shadow-2xl backdrop-blur-md xl:flex-row">
								<Select
									className="flex-4 xl:flex-3 border-none"
									variant="flat"
									radius="lg"
									aria-label={'city'}
									selectedKeys={[destination]}
									onChange={e => setDestination(e.target.value)}
									placeholder="Bạn muốn đến đâu?"
									startContent={<i className="fas fa-map-marker-alt text-blue-600"></i>}
								>
									{PROVINCES.map(x => (
										<SelectItem
											aria-label={x.name}
											key={x.id}
										>
											{x.name}
										</SelectItem>
									))}
								</Select>

								<DateRangePicker
									radius="lg"
									variant="flat"
									visibleMonths={2}
									className="flex-5 border-none"
									value={dateRange}
									onChange={setDateRange}
									minValue={today(getLocalTimeZone())}
								/>

								<Popover
									placement="bottom"
									offset={10}
								>
									<PopoverTrigger>
										<Button className={cn('flex-3 w-full rounded-xl border-none bg-gray-100 xl:min-w-[250px]', havePet && 'min-w-[300px]')}>
											<div className="flex items-center gap-2">
												<i className="fas fa-users text-blue-600"></i>
												<span>Phòng {personCount} người · {roomCount} phòng {havePet && '· Vật nuôi'}</span>
											</div>
											<i
												className="fa fa-chevron-down text-gray-500"
												aria-hidden="true"
											></i>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="rounded-2xl shadow-xl">
										<div className="flex w-[320px] flex-col gap-4 p-5">
											<div className="flex items-center justify-between">
												<p className="font-semibold text-gray-800">Số người mỗi phòng</p>
												<NumberInput
													size="sm"
													onChange={e => setPersonCount(e)}
													value={personCount}
													max={1000}
													min={1}
													className="w-28"
												>
													<NumberInputField className="text-center" />
													<NumberInputStepper>
														<NumberIncrementStepper />
														<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
											</div>

											<div className="flex items-center justify-between">
												<p className="font-semibold text-gray-800">Số phòng</p>
												<NumberInput
													size="sm"
													onChange={e => setRoomCount(e)}
													value={roomCount}
													max={1000}
													min={1}
													className="w-28"
												>
													<NumberInputField className="text-center" />
													<NumberInputStepper>
														<NumberIncrementStepper />
														<NumberDecrementStepper />
													</NumberInputStepper>
												</NumberInput>
											</div>

											<Divider />

											<div className="flex items-center justify-between">
												<p className="font-semibold text-gray-800">Vật nuôi</p>
												<Switch
													isSelected={havePet}
													onChange={() => setHavePet(!havePet)}
													color="primary"
													size="lg"
												/>
											</div>
										</div>
									</PopoverContent>
								</Popover>

								<Button
									onClick={() => handleSearch()}
									variant="shadow"
									radius="lg"
									className="w-full min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-blue-600 xl:w-fit"
								>
									Tìm kiếm
								</Button>
							</div>
						</div>
					)}

					{!showText && showSearch && <div className="pb-9" />}
					{!showText && !showSearch && <div className="pb-5" />}
				</main>
			</div>
		</div>
	)
}

export default Header
