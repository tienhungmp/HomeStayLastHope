import {NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper} from '@chakra-ui/react'
import GoogleMapLink from '@components/map/GoogleMapLink'
import MapView from '@components/map/MapView'
import {Button, Image} from '@nextui-org/react'
import {RouterPath} from '@router/RouterPath'
import {AMENITIES, TYPE_HOST} from '@utils/constants'
import {cn, convertStringToNumber, getDate} from '@utils/Utils'
import 'leaflet/dist/leaflet.css'
import {useEffect, useRef, useState} from 'react'
import {useParams} from 'react-router-dom'
import ImageGallery from '../../components/galery/Galery'
import Loading from '../../components/loading/Loading'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'
import useRouter from '../../hook/use-router'
import {AMENITIES_ROOM} from '../../utils/constData'

export default function DetailPage() {
	const router = useRouter()
	const {id} = useParams()
	const {onOpen} = useModalCommon()

	const overviewRef = useRef()
	const infoRef = useRef()
	const commentsRef = useRef()
	const amenityRef = useRef()
	const noteRef = useRef()

	const [activeSection, setActiveSection] = useState('overview')
	const [numbers, setNumbers] = useState([])
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const {auth} = useAuth()
	
	useEffect(() => {
		if (!id) return
		factories
			.getDetailAccommodation(id)
			.then(data => setData(data))
			.finally(() => setLoading(false))
	}, [id])

	async function handleConfirm() {
		const payload = {
			userId: auth._id,
			accommodationId: id,
			rooms: {
				roomId: numbers[0]?.roomId,
				bookedQuantity: numbers[0]?.number
			}
		}

		try {
			const res = await factories.checkRoomAvailability(payload)
			if (!res.available) {
				alert('Số lượng phòng bạn chọn vượt quá số phòng còn trống. Vui lòng chọn lại!')
				return
			}
		} catch (err) {
			console.error('Room availability check failed:', err)
			alert('Số lượng phòng bạn chọn vượt quá số phòng còn trống. Vui lòng chọn lại!')
			return
		}

		const ticket = {
			...data,
			roomsSelected: numbers,
		}
		const encodedItem = encodeURIComponent(JSON.stringify(ticket))
		router.push({
			pathname: RouterPath.CONFIRM_INFORMATION,
			params: {
				item: encodedItem,
			},
		})
	}
	
	function handlePressScroll(ref, sectionName) {
		setActiveSection(sectionName)
		scrollToSection(ref)
	}
	
	function scrollToSection(ref) {
		if (ref.current) {
			ref.current.scrollIntoView({behavior: 'smooth', block: 'start'})
		}
	}

	function openModalImageGallery(images) {
		onOpen({
			view: <ImageGallery images={images} />,
			title: 'Thư viện ảnh',
			size: '5xl',
			showFooter: false,
		})
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<SectionNavigator />

				{loading ? (
					<Loading />
				) : (
					<div className="space-y-10">
						<Overview />
						<InfoPrice />
						{data?.noteAccommodation && <NoteRender note={data?.noteAccommodation} />}
						<CommentList data={data.tickets} />
					</div>
				)}
			</div>
			
			{/* Bottom padding for fixed booking bar */}
			{auth && numbers.reduce((total, number) => total + number.number, 0) > 0 && (
				<div className="h-24"></div>
			)}
		</div>
	)

	// Section Navigator
	function SectionNavigator() {
		const sections = [
			{key: 'overview', label: 'Tổng quan', ref: overviewRef},
			{key: 'info', label: 'Phòng & Giá', ref: infoRef},
			{key: 'amenity', label: 'Tiện nghi', ref: amenityRef},
			...(data?.noteAccommodation ? [{key: 'note', label: 'Ghi chú', ref: noteRef}] : []),
			{key: 'comments', label: 'Đánh giá', ref: commentsRef}
		]

		return (
			<nav className="sticky top-0 z-40 mb-6 -mx-4 bg-white shadow-sm sm:-mx-6 lg:-mx-8">
				<div className="mx-auto max-w-7xl">
					<div className="flex overflow-x-auto scrollbar-hide">
						{sections.map(({key, label, ref}) => (
							<button
								key={key}
								onClick={() => handlePressScroll(ref, key)}
								className={cn(
									'relative flex-shrink-0 border-b-2 px-6 py-4 text-sm font-medium transition-colors',
									activeSection === key
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
								)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</nav>
		)
	}

	// Overview Section
	function Overview() {
		return (
			<div ref={overviewRef}>
				{/* Header */}
				<div className="mb-6">
					<h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
						{data.name}
					</h1>
					<div className="flex items-center gap-2 text-gray-600">
						<svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
						</svg>
						<span className="text-sm">{data.address}</span>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 lg:col-span-2">
						{/* Image Gallery */}
						<div className="grid grid-cols-4 gap-2 sm:gap-3">
							<div
								className="col-span-4 cursor-pointer overflow-hidden rounded-xl sm:col-span-2 sm:row-span-2"
								onClick={() => openModalImageGallery(data?.images)}
							>
								<Image
									className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
									src={data.images[0]}
									alt="Main view"
									style={{height: '100%', minHeight: '350px'}}
								/>
							</div>
							{data.images.slice(1, 5).map((image, index) => (
								<div
									key={index}
									className="group relative col-span-2 cursor-pointer overflow-hidden rounded-xl sm:col-span-1"
									onClick={() => openModalImageGallery(data?.images)}
								>
									<Image
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										src={image}
										alt={`View ${index + 2}`}
										style={{height: '100%', minHeight: '170px'}}
									/>
									{index === 3 && data.images.length > 5 && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/50">
											<span className="text-xl font-bold text-white">
												+{data.images.length - 5}
											</span>
										</div>
									)}
								</div>
							))}
						</div>

						{/* Description */}
						<div className="rounded-xl bg-white p-5 shadow-sm">
							<h2 className="mb-3 text-xl font-bold text-gray-900">Mô tả</h2>
							<div
								className="prose prose-sm max-w-none text-gray-700"
								dangerouslySetInnerHTML={{__html: data?.description}}
							/>
						</div>

						{/* Amenities */}
						<div ref={amenityRef} className="rounded-xl bg-white p-5 shadow-sm">
							<h2 className="mb-4 text-xl font-bold text-gray-900">Tiện nghi</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{data.amenities.map(amenity => {
									const item = AMENITIES.find(i => i.id === amenity)
									if (!item) return null
									return (
										<div
											key={item.id}
											className="flex items-center gap-3 rounded-lg bg-blue-50/50 p-3"
										>
											{item.icon && (
												<span className="text-xl text-blue-600">
													{item.icon()}
												</span>
											)}
											<p className="text-sm font-medium text-gray-700">{item.title}</p>
										</div>
									)
								})}
							</div>
						</div>

						{/* Map */}
						<div className="rounded-xl bg-white p-5 shadow-sm">
							<div className="mb-3 flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900">Vị trí</h2>
								<GoogleMapLink lat={data?.lat} lng={data?.lng} />
							</div>
							<div className="overflow-hidden rounded-lg">
								<MapView zoom={20} height={'350px'} width={'100%'} lat={data?.lat} lng={data?.lng} />
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-20">
							<div className="rounded-xl bg-white shadow-sm">
								{/* Rating */}
								<div className="border-b p-5">
									<h3 className="mb-3 font-bold text-gray-900">Đánh giá</h3>
									{!data?.rating ? (
										<p className="text-center text-sm text-gray-500">Chưa có đánh giá</p>
									) : (
										<div className="flex justify-center gap-1">
											{Array.from({length: 5}, (_, index) => (
												<i
													key={index}
													className={`fas fa-star text-lg ${index < data?.rating ? 'text-yellow-400' : 'text-gray-300'}`}
												></i>
											))}
										</div>
									)}
								</div>

								{/* Outstanding */}
								{!!data?.outstanding && (
									<div className="border-b p-5">
										<h3 className="mb-3 font-bold text-gray-900">Điểm nổi bật</h3>
										<div
											className="prose prose-sm max-w-none text-gray-600"
											dangerouslySetInnerHTML={{__html: data?.outstanding}}
										></div>
									</div>
								)}

								{/* Options */}
								{!!data?.options && (
									<div className="border-b p-5">
										<h3 className="mb-3 font-bold text-gray-900">Các lựa chọn</h3>
										<div
											className="prose prose-sm max-w-none text-gray-600"
											dangerouslySetInnerHTML={{__html: data?.options}}
										></div>
									</div>
								)}

								{/* Activities */}
								{!!data?.activities && (
									<div className="border-b p-5">
										<h3 className="mb-3 font-bold text-gray-900">Hoạt động</h3>
										<div
											className="prose prose-sm max-w-none text-gray-600"
											dangerouslySetInnerHTML={{__html: data?.activities}}
										></div>
									</div>
								)}

								{/* CTA Button */}
								<div className="p-5">
									<button
										onClick={() => handlePressScroll(infoRef, 'info')}
										className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white transition-all hover:shadow-lg active:scale-95"
									>
										Xem phòng & Đặt ngay
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Info Price Section
	function InfoPrice() {
		const totalAmount = numbers.reduce((total, number) => total + number.price * number.number, 0)
		const totalRooms = numbers.reduce((total, number) => total + number.number, 0)

		return (
			<div ref={infoRef}>
				<div className="mb-5">
					<h2 className="text-2xl font-bold text-gray-900">Phòng trống</h2>
					<p className="mt-1 text-sm text-gray-600">Chọn phòng phù hợp với nhu cầu của bạn</p>
				</div>

				<div className="space-y-4">
					{data?.rooms?.filter(room => room.isVisible === true).map((room, index) => (
						<div
							key={index}
							className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex flex-col lg:flex-row">
								{/* Room Image */}
								<div className="relative lg:w-72 lg:flex-shrink-0">
									<button
										className="group/img relative block h-48 w-full overflow-hidden lg:h-full"
										onClick={() => openModalImageGallery(room?.images ?? [])}
									>
										<img
											src={room.images?.[0]}
											alt="Room view"
											className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
											<div className="rounded-md bg-white/95 px-3 py-1.5">
												<span className="text-sm font-semibold text-gray-900">
													Xem {room.images.length} ảnh
												</span>
											</div>
										</div>
									</button>
								</div>

								{/* Room Content */}
								<div className="flex flex-1 flex-col p-4 lg:p-5">
									{/* Header with Price */}
									<div className="mb-3 flex items-start justify-between gap-4">
										<div className="flex-1">
											<h3 className="mb-1 text-lg font-bold text-gray-900">{room.name}</h3>
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
												</svg>
												<span>{room.capacity} khách</span>
											</div>
										</div>
										<div className="text-right">
											<div className="text-xs text-gray-500">Mỗi đêm</div>
											<div className="text-xl font-bold text-emerald-600">
												{convertStringToNumber(room?.pricePerNight)}
											</div>
										</div>
									</div>

									{/* Description */}
									<div
										className="prose prose-sm mb-3 max-w-none text-gray-600 line-clamp-2"
										dangerouslySetInnerHTML={{__html: room.description}}
									></div>

									{/* Amenities Compact */}
									<div className="mb-3 flex flex-wrap gap-2">
										{AMENITIES_ROOM.slice(0, 4).map(amenity => {
											const hasSelectedChild = amenity.items.some(item => room.amenities.includes(item.id))
											if (room.amenities.includes(amenity.id) || hasSelectedChild) {
												return (
													<div key={amenity.id} className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1">
														<span className="text-sm text-blue-600">{amenity.icon()}</span>
														<span className="text-xs font-medium text-gray-700">
															{amenity.title}
														</span>
													</div>
												)
											}
										})}
										{AMENITIES_ROOM.filter(amenity => {
											const hasSelectedChild = amenity.items.some(item => room.amenities.includes(item.id))
											return room.amenities.includes(amenity.id) || hasSelectedChild
										}).length > 4 && (
											<button
												onClick={() => openModalImageGallery(room?.images ?? [])}
												className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
											>
												+{AMENITIES_ROOM.filter(amenity => {
													const hasSelectedChild = amenity.items.some(item => room.amenities.includes(item.id))
													return room.amenities.includes(amenity.id) || hasSelectedChild
												}).length - 4}
											</button>
										)}
									</div>

									{/* Action Area */}
									{auth && (
										<div className="mt-auto flex items-center justify-between gap-4 border-t pt-3">
											<div>
												<label className="mb-1.5 block text-xs font-medium text-gray-700">
													Số lượng phòng
												</label>
												<NumberInput
													className="w-32"
													defaultValue={0}
													min={0}
													max={100}
													value={numbers.find(number => number.roomId === room._id)?.number ?? 0}
													onChange={value =>
														setNumbers(prev => {
															const index = prev.findIndex(number => number.roomId === room._id)
															if (index !== -1) {
																return prev.map(number => (number.roomId === room._id ? {...number, number: value} : number))
															} else {
																return [...prev, {roomId: room._id, number: value, price: room.pricePerNight}]
															}
														})
													}
													clampValueOnBlur={false}
												>
													<NumberInputField className="h-10 rounded-lg border-2 border-gray-300 text-center font-semibold hover:border-blue-400 focus:border-blue-500" />
													<NumberInputStepper>
														<NumberIncrementStepper className="hover:bg-blue-50" />
														<NumberDecrementStepper className="hover:bg-blue-50" />
													</NumberInputStepper>
												</NumberInput>
											</div>
											
											{numbers.find(n => n.roomId === room._id)?.number > 0 && (
												<div className="rounded-lg bg-emerald-50 px-4 py-2">
													<div className="text-xs text-gray-600">Tạm tính</div>
													<div className="text-lg font-bold text-emerald-600">
														{convertStringToNumber(
															room.pricePerNight * (numbers.find(n => n.roomId === room._id)?.number || 0)
														)}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Fixed Booking Summary */}
				{auth && totalRooms > 0 && (
					<div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-2xl">
						<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
							<div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
								<div className="flex items-center gap-6">
									<div>
										<div className="text-xs text-gray-600">Tổng cộng</div>
										<div className="text-2xl font-bold text-emerald-600">
											{convertStringToNumber(totalAmount)}
										</div>
									</div>
									<div className="h-10 w-px bg-gray-300"></div>
									<div className="text-center">
										<div className="text-xs text-gray-600">Số phòng</div>
										<div className="text-xl font-bold text-gray-900">{totalRooms}</div>
									</div>
								</div>
								<Button
									className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-2.5 font-semibold text-white transition-all hover:shadow-lg active:scale-95 sm:w-auto"
									onClick={() => handleConfirm(numbers)}
								>
									Đặt phòng ngay
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		)
	}

	// Review Component
	function Review({review}) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
				<div className="mb-3 flex items-start justify-between gap-4">
					<div className="flex gap-3">
						<img
							src={review?.userId?.profilePictureUrl}
							alt="User avatar"
							className="h-12 w-12 rounded-full border-2 border-blue-50 object-cover"
						/>
						<div>
							<h3 className="font-bold text-gray-900">{review.userId?.fullName}</h3>
							<div className="text-xs text-gray-500">{review?.stayDetails}</div>
							<div className="text-xs text-gray-500">{review?.stayDuration}</div>
						</div>
					</div>
					<div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-yellow-400 to-orange-400 px-2.5 py-1">
						{[...Array(review.star)].map((_, i) => (
							<i key={i} className="fas fa-star text-xs text-white"></i>
						))}
					</div>
				</div>
				<div className="mb-2 text-xs text-gray-500">{getDate(review?.fromDate)}</div>
				<p className="text-sm text-gray-700">{review.review}</p>
			</div>
		)
	}

	// Comment List
	function CommentList({data}) {
		return (
			<div ref={commentsRef}>
				<div className="mb-5">
					<h2 className="text-2xl font-bold text-gray-900">Đánh giá của khách</h2>
					<p className="mt-1 text-sm text-gray-600">Trải nghiệm thực tế từ khách hàng</p>
				</div>
				
				{data?.length === 0 ? (
					<div className="flex min-h-[180px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white">
						<div className="text-center">
							<i className="fas fa-comments mb-2 text-3xl text-gray-400"></i>
							<p className="font-semibold text-gray-500">Chưa có đánh giá nào</p>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{data?.map(review => <Review key={review.id} review={review} />)}
					</div>
				)}
			</div>
		)
	}

	// Note Render
	function NoteRender({note}) {
		if (note)
			return (
				<div ref={noteRef}>
					<div className="mb-5">
						<h2 className="text-2xl font-bold text-gray-900">Ghi chú quan trọng</h2>
					</div>
					<div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm">
						<div className="mb-3 flex items-center gap-2 text-amber-700">
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
							</svg>
							<span className="font-bold">Lưu ý</span>
						</div>
						<div
							className="prose prose-sm max-w-none text-gray-700"
							dangerouslySetInnerHTML={{__html: note}}
						></div>
					</div>
				</div>
			)
	}
}