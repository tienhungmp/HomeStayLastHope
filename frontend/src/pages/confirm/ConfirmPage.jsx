import DatePickerField from '@components/common/DatePickerField'
import ImageGallery from '@components/galery/Galery'
import {useAuth} from '@context/AuthContext.jsx'
import {useModalCommon} from '@context/ModalContext.jsx'
import {getLocalTimeZone, now} from '@internationalized/date'
import {Button, Image} from '@nextui-org/react'
import {RouterPath} from '@router/RouterPath'
import {PROVINCES, TYPE_HOST} from '@utils/constants'
import {convertStringToNumber, getDate, ToastInfo, ToastNotiError} from '@utils/Utils'
import React, {useEffect, useMemo, useState} from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import {factories} from '../../factory'
import useRouter from '../../hook/use-router'

export default function ConfirmPage() {
	const [loading, setLoading] = useState(false)
	const methods = useForm()
	const {setValue} = methods
	const {auth} = useAuth()
	const router = useRouter()
	const params = router.getAll()
	const data = JSON.parse(decodeURIComponent(params.item))
	const {onOpen} = useModalCommon()

	const STANDARD_CHECKOUT_HOUR = data.standardCheckOutHour || 12

	useEffect(() => {
		scrollTo(0, 0)
	}, [])

	const calculateNights = (fromDateTime, toDateTime) => {
		if (!fromDateTime || !toDateTime) return 0
		
		const fromDate = new Date(fromDateTime.year, fromDateTime.month - 1, fromDateTime.day, 
			fromDateTime.hour || 0, fromDateTime.minute || 0)
		const toDate = new Date(toDateTime.year, toDateTime.month - 1, toDateTime.day,
			toDateTime.hour || 0, toDateTime.minute || 0)
		
		const diffMs = toDate - fromDate
		const diffDays = diffMs / (1000 * 60 * 60 * 24)
		
		return Math.ceil(diffDays)
	}

	const calculateLateFee = (toDateTime, pricePerNight) => {
		if (!toDateTime) return 0

		const standardCheckOut = new Date(
			toDateTime.year, 
			toDateTime.month - 1, 
			toDateTime.day,
			STANDARD_CHECKOUT_HOUR,
			0
		)

		const actualCheckOut = new Date(
			toDateTime.year,
			toDateTime.month - 1, 
			toDateTime.day,
			toDateTime.hour || 0,
			toDateTime.minute || 0
		)

		const lateMs = actualCheckOut - standardCheckOut
		const lateHours = lateMs / (1000 * 60 * 60)

		let lateFee = 0
		if (lateHours > 0) {
			if (lateHours <= 3) {
				lateFee = pricePerNight * 0.25
			} else if (lateHours <= 6) {
				lateFee = pricePerNight * 0.50
			} else {
				lateFee = pricePerNight * 1.0
			}
		}

		return {lateFee, lateHours: Math.max(0, lateHours)}
	}

	function handleSave(values) {
		if (!values.fromDate) {
			ToastNotiError('Vui lòng chọn ngày giờ nhận phòng')
			return
		}
		if (!values.toDate) {
			ToastNotiError('Vui lòng chọn ngày giờ trả phòng')
			return
		}

		const numNights = calculateNights(values.fromDate, values.toDate)
		
		if (numNights < 1) {
			ToastNotiError('Thời gian thuê phải tối thiểu 1 đêm')
			return
		}
		
		setLoading(true)
		const newFromDate = getDate(values.fromDate, 8)
		const newToDate = getDate(values.toDate, 8)

		const pricePerNightTotal = data.roomsSelected.reduce(
			(total, room) => total + room.price * room.number, 
			0
		)

		const {lateFee} = calculateLateFee(values.toDate, pricePerNightTotal)

		const basePrice = pricePerNightTotal * numNights
		const totalPrice = basePrice + lateFee

		const newTicket = {
			userId: auth._id,
			accommodationId: data._id,
			fromDate: newFromDate,
			toDate: newToDate,
			rooms: data.roomsSelected.map(x => ({
				roomId: x.roomId,
				bookedQuantity: x.number,
			})),
			basePrice: basePrice,
			lateFee: lateFee,
			totalPrice: totalPrice,
		}

		if(newTicket.totalPrice <= 0) {
			ToastNotiError('Ngày không hợp lệ')
			setLoading(false)
			return
		}

		factories
			.createTicket(newTicket)
			.then(() => {
				setLoading(false)
				ToastInfo('Đặt phòng thành công')
				router.push({
					pathname: RouterPath.MY_TICKET,
				})
			})
			.catch(err => {
				if (err.response?.data?.message) {
					ToastNotiError(err.response?.data?.message)
				}
				setLoading(false)
			})
	}

	useEffect(() => {
		if (auth) {
			setValue('fullName', auth.fullName)
			setValue('phone', auth.phone)
			setValue('email', auth.email)
		}
	}, [auth])

	function openModalImageGallery(images) {
		onOpen({
			view: <ImageGallery images={images} />,
			title: 'Thư viện ảnh',
			size: '5xl',
			showFooter: false,
		})
	}

	useEffect(() => {
		setValue('fromDate', now(getLocalTimeZone()))
		const defaultToDate = now(getLocalTimeZone()).add({days: 1}).set({
			hour: STANDARD_CHECKOUT_HOUR,
			minute: 0
		})
		setValue('toDate', defaultToDate)
	}, [])

	const priceInfo = useMemo(() => {
		const fromDate = methods.watch('fromDate')
		const toDate = methods.watch('toDate')
		
		if (!fromDate || !toDate) return {
			numNights: 0, 
			basePrice: 0, 
			lateFee: 0, 
			totalPrice: 0,
			lateHours: 0
		}
		
		const numNights = calculateNights(fromDate, toDate)
		
		const pricePerNightTotal = data.roomsSelected.reduce(
			(total, room) => total + room.price * room.number, 
			0
		)

		const {lateFee, lateHours} = calculateLateFee(toDate, pricePerNightTotal)

		const basePrice = pricePerNightTotal * numNights
		const totalPrice = basePrice + lateFee
		
		return {
			numNights: Math.max(0, numNights),
			basePrice,
			lateFee,
			totalPrice,
			lateHours
		}
	}, [methods.watch('fromDate'), methods.watch('toDate')])

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(handleSave)} className="space-y-6">
						{/* Header */}
						<div className="text-center">
							<h1 className="text-3xl font-bold text-gray-900">Xác nhận đặt phòng</h1>
							<p className="mt-2 text-sm text-gray-600">Kiểm tra thông tin và hoàn tất đặt phòng</p>
						</div>

						{/* Accommodation Info */}
						<div className="overflow-hidden rounded-xl bg-white shadow-sm">
							<div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
								<h2 className="text-lg font-semibold text-gray-900">Thông tin chỗ nghỉ</h2>
							</div>
							<div className="p-6">
								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => openModalImageGallery(data?.images ?? [])}
										className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
									>
										<Image
											src={data.images[0] ?? 'https://static.vexere.com/production/images/1716953194738.jpeg?w=250&h=250'}
											alt="Accommodation"
											className="h-full w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
											<span className="text-xs font-semibold text-white">Xem ảnh</span>
										</div>
									</button>
									<div className="flex-1">
										<h3 className="mb-1 text-lg font-bold text-gray-900">{data.name}</h3>
										<p className="mb-1 text-sm text-gray-600">{data.address}</p>
										<div className="flex items-center gap-2 text-sm">
											<span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700">
												{PROVINCES.find(x => x.value === data.city)?.label}
											</span>
											<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-700">
												{TYPE_HOST.find(x => x.id === data.type)?.name}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Date Selection */}
						<div className="overflow-hidden rounded-xl bg-white shadow-sm">
							<div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
								<h2 className="text-lg font-semibold text-gray-900">Thời gian thuê</h2>
							</div>
							<div className="p-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<DatePickerField
										label="Ngày giờ nhận phòng"
										name="fromDate"
										isRequired
										granularity="minute"
										hourCycle={24}
										minValue={now(getLocalTimeZone())}
										validate={{required: 'Bắt buộc chọn'}}
									/>
									<DatePickerField
										label="Ngày giờ trả phòng"
										name="toDate"
										isRequired
										granularity="minute"
										hourCycle={24}
										minValue={
											methods.watch('fromDate')
												?.add({days: 1})
												?.set({hour: STANDARD_CHECKOUT_HOUR, minute: 0}) 
											?? now(getLocalTimeZone()).add({days: 1}).set({hour: STANDARD_CHECKOUT_HOUR, minute: 0})
										}
										validate={{required: 'Bắt buộc chọn'}}
									/>
								</div>

								{/* Time Info */}
								<div className="mt-4 space-y-3">
									<div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
										<span className="text-sm font-medium text-gray-700">Số đêm</span>
										<span className="text-lg font-bold text-blue-600">{priceInfo.numNights} đêm</span>
									</div>

									<div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
										<span className="text-xs text-gray-600">Giờ check-out tiêu chuẩn</span>
										<span className="text-sm font-semibold text-gray-700">{STANDARD_CHECKOUT_HOUR}:00</span>
									</div>

									{priceInfo.lateHours > 0 && (
										<div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-3">
											<div className="mb-1 flex items-center justify-between">
												<span className="flex items-center gap-1.5 text-sm font-semibold text-orange-700">
													<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
													</svg>
													Trễ giờ
												</span>
												<span className="text-sm font-bold text-orange-700">
													{priceInfo.lateHours.toFixed(1)} giờ
												</span>
											</div>
											<p className="text-xs text-orange-600">
												{priceInfo.lateHours <= 3 && 'Phí trễ: 25% giá 1 đêm'}
												{priceInfo.lateHours > 3 && priceInfo.lateHours <= 6 && 'Phí trễ: 50% giá 1 đêm'}
												{priceInfo.lateHours > 6 && 'Phí trễ: 100% giá 1 đêm (tính thêm 1 ngày)'}
											</p>
										</div>
									)}

									{priceInfo.numNights < 1 && (
										<div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
											<p className="text-sm font-medium text-red-700">
												⚠ Thời gian thuê tối thiểu 1 đêm
											</p>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Room Details */}
						<div className="overflow-hidden rounded-xl bg-white shadow-sm">
							<div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
								<h2 className="text-lg font-semibold text-gray-900">Chi tiết phòng</h2>
							</div>
							<div className="divide-y divide-gray-100 p-6">
								{data.roomsSelected?.map((room, index) => {
									const roomT = data.rooms.find(x => x._id === room.roomId)
									return (
										<div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
											<button
												type="button"
												onClick={() => openModalImageGallery(roomT?.images ?? [])}
												className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
											>
												<img
													src={roomT.images?.[0]}
													alt="Room"
													className="h-full w-full object-cover"
												/>
												<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
													<span className="text-xs font-bold text-white">+{roomT.images.length}</span>
												</div>
											</button>
											
											<div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
												<div>
													<h3 className="mb-1 font-semibold text-gray-900">{roomT.name}</h3>
													<div className="flex items-center gap-3 text-sm text-gray-600">
														<span className="flex items-center gap-1">
															<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
																<path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
															</svg>
															{roomT.capacity} khách
														</span>
														<span>•</span>
														<span>x{room.number} phòng</span>
														<span>•</span>
														<span>{priceInfo.numNights} đêm</span>
													</div>
												</div>
												<div className="mt-2 text-right sm:mt-0">
													<div className="text-sm text-gray-500">
														{convertStringToNumber(roomT.pricePerNight)}/đêm
													</div>
													<div className="text-lg font-bold text-gray-900">
														{convertStringToNumber(roomT.pricePerNight * room.number * priceInfo.numNights)}
													</div>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>

						{/* Price Summary */}
						<div className="overflow-hidden rounded-xl bg-white shadow-sm">
							<div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
								<h2 className="text-lg font-semibold text-gray-900">Chi tiết thanh toán</h2>
							</div>
							<div className="p-6">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-gray-700">
											Giá phòng ({priceInfo.numNights} đêm)
										</span>
										<span className="font-semibold text-gray-900">
											{convertStringToNumber(priceInfo.basePrice)}
										</span>
									</div>
									
									{priceInfo.lateFee > 0 && (
										<div className="flex items-center justify-between">
											<span className="text-orange-600">
												Phí trễ giờ ({priceInfo.lateHours.toFixed(1)}h)
											</span>
											<span className="font-semibold text-orange-600">
												+{convertStringToNumber(priceInfo.lateFee)}
											</span>
										</div>
									)}
									
									<div className="border-t border-gray-200 pt-3">
										<div className="flex items-center justify-between">
											<span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
											<span className="text-2xl font-bold text-blue-600">
												{convertStringToNumber(priceInfo.totalPrice)}
											</span>
										</div>
									</div>
								</div>

								<Button
									color="primary"
									type="submit"
									className="mt-6 h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-semibold"
									variant="shadow"
									isLoading={loading}
									isDisabled={priceInfo.numNights < 1}
								>
									{loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
								</Button>

								<p className="mt-3 text-center text-xs text-gray-500">
									Bằng việc đặt phòng, bạn đồng ý với điều khoản sử dụng của chúng tôi
								</p>
							</div>
						</div>
					</form>
				</FormProvider>
			</div>
		</div>
	)
}