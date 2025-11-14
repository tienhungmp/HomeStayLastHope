import DatePickerField from '@components/common/DatePickerField'
import ImageGallery from '@components/galery/Galery'
import {useAuth} from '@context/AuthContext.jsx'
import {useModalCommon} from '@context/ModalContext.jsx'
import {getLocalTimeZone, now, today} from '@internationalized/date'
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

	useEffect(() => {
		scrollTo(0, 0)
	}, [])

	// Hàm tính số giờ giữa 2 mốc thời gian
	const calculateHoursDifference = (fromDateTime, toDateTime) => {
		if (!fromDateTime || !toDateTime) return 0
		
		const fromDate = new Date(fromDateTime.year, fromDateTime.month - 1, fromDateTime.day, 
			fromDateTime.hour || 0, fromDateTime.minute || 0)
		const toDate = new Date(toDateTime.year, toDateTime.month - 1, toDateTime.day,
			toDateTime.hour || 0, toDateTime.minute || 0)
		
		const diffMs = toDate - fromDate
		const diffHours = diffMs / (1000 * 60 * 60)
		
		return diffHours
	}

	// Hàm tính số ngày (làm tròn lên nếu > 0)
	const calculateDays = (hours) => {
		if (hours <= 0) return 0
		return Math.ceil(hours / 24)
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

		const hoursDiff = calculateHoursDifference(values.fromDate, values.toDate)
		
		// Kiểm tra tối thiểu 24 giờ (1 ngày)
		if (hoursDiff < 24) {
			ToastNotiError('Thời gian thuê phải tối thiểu 1 ngày (24 giờ)')
			return
		}
		
		setLoading(true)
		const newFromDate = getDate(values.fromDate, 8)
		const newToDate = getDate(values.toDate, 8)
		const days = calculateDays(hoursDiff)

		const newTicket = {
			userId: auth._id,
			accommodationId: data._id,
			fromDate: newFromDate,
			toDate: newToDate,
			rooms: data.roomsSelected.map(x => ({
				roomId: x.roomId,
				bookedQuantity: x.number,
			})),
			totalPrice: data.roomsSelected.reduce((total, number) => total + number.price * number.number, 0) * days,
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
		// Mặc định toDate = fromDate + 24 giờ
		const defaultToDate = now(getLocalTimeZone()).add({hours: 24})
		setValue('toDate', defaultToDate)
	}, [])

	const timeInfo = useMemo(() => {
		const fromDate = methods.watch('fromDate')
		const toDate = methods.watch('toDate')
		
		if (!fromDate || !toDate) return {hours: 0, days: 0}
		
		const hours = calculateHoursDifference(fromDate, toDate)
		const days = calculateDays(hours)
		
		return {hours: Math.max(0, hours), days}
	}, [methods.watch('fromDate'), methods.watch('toDate')])

	return (
		<div className="mx-auto mb-20 mt-16 flex max-w-full justify-center gap-4 px-5 lg:max-w-[70%] lg:px-0 2xl:max-w-[60%]">
			<FormProvider {...methods}>
				<form onSubmit={methods.handleSubmit(handleSave)}>
					<div className="mx-auto flex justify-between gap-10">
						<div className="flex flex-col gap-4">
							<div className="w-full rounded-lg border p-6 shadow-lg">
								<p className="mb-4 text-center text-2xl font-bold text-blue-500">Xác nhận đặt phòng</p>
								<div className="mb-4 flex items-center">
									<Image
										src={data.images[0] ?? 'https://static.vexere.com/production/images/1716953194738.jpeg?w=250&h=250'}
										alt="Bus image"
										className="mr-4 h-24 w-24"
									/>
									<div>
										<h3 className="font-semibold">{data.name}</h3>
										<h3 className="text-[10px] font-semibold">{data.address}</h3>
										<h3 className="font-semibold">{PROVINCES.find(x => x.value === data.city)?.label}</h3>
										<p className="text-md text-gray-800">{TYPE_HOST.find(x => x.id === data.type)?.name}</p>
									</div>
								</div>
								<h2 className="mb-4 text-lg font-semibold">Thông tin thuê</h2>
								<div className="mb-4 flex items-center justify-between">
									<div className="flex items-center gap-4">
										<span className="w-full flex-1 text-sm">
											<DatePickerField
												label="Ngày giờ nhận phòng"
												name="fromDate"
												isRequired
												granularity="minute"
												hourCycle={24}
												minValue={now(getLocalTimeZone())}
												validate={{required: 'Bắt buộc chọn'}}
											/>
										</span>
										<span className="flex-1 text-sm">
											<DatePickerField
												label="Ngày giờ trả phòng"
												name="toDate"
												isRequired
												granularity="minute"
												hourCycle={24}
												minValue={methods.watch('fromDate')?.add({hours: 24}) ?? now(getLocalTimeZone()).add({hours: 24})}
												validate={{required: 'Bắt buộc chọn'}}
											/>
										</span>
									</div>
								</div>
								
								{/* Hiển thị thông tin thời gian */}
								<div className="mb-4 rounded-lg bg-blue-50 p-3">
									<div className="flex justify-between text-sm">
										<span className="font-medium">Thời gian thuê:</span>
										<span className="font-semibold text-blue-600">
											{timeInfo.hours > 0 ? `${timeInfo.hours.toFixed(1)} giờ (${timeInfo.days} ngày)` : '0 giờ'}
										</span>
									</div>
									{timeInfo.hours > 0 && timeInfo.hours < 24 && (
										<p className="mt-2 text-xs text-red-500">
											⚠ Tối thiểu phải thuê 24 giờ (1 ngày)
										</p>
									)}
								</div>

								<hr className="my-4 border-gray-300" />
								<div className="flex flex-col gap-4">
									{data.roomsSelected?.map((room, index) => {
										const roomT = data.rooms.find(x => x._id === room.roomId)
										return (
											<div
												key={index}
												className="flex w-full flex-col gap-2"
											>
												<div className="flex w-full flex-row items-center gap-5">
													<button
														className="relative"
														type="button"
														onClick={() => openModalImageGallery(roomT?.images ?? [])}
													>
														<Image
															src={roomT.images?.[0]}
															alt="Resort view 6"
															className="z-auto aspect-square w-28"
														/>
														<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-10 text-lg font-bold text-white">
															+{roomT.images.length}
														</div>
													</button>
													<div className="flex w-full flex-row justify-between">
														<div className="flex flex-col gap-1">
															<div className="flex items-center gap-2">
																<p className="text-sm font-semibold">{roomT.name}</p>
																<div className="flex flex-row items-center gap-1">
																	<p className="text-sm font-semibold">{roomT.capacity}</p>
																	<i className="fas fa-user ml-0 mr-2 text-gray-500"></i>
																</div>
															</div>
															<div className="flex items-center gap-2">
																<p>Số lượng phòng</p>
															</div>
															<div className="flex items-center gap-2">
																<p>Thời gian</p>
															</div>
														</div>
														<div className="flex flex-col items-end justify-end gap-2">
															<p className="text-sm text-gray-500">{convertStringToNumber(roomT.pricePerNight * room.number)}</p>
															<p className="text-sm text-gray-500">x{room.number}</p>
															<p className="text-sm text-gray-500">{timeInfo.days} ngày</p>
														</div>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
							<div className="mb-5 w-full rounded-lg border p-6 px-4 shadow-lg">
								<div className="mb-4 flex items-center justify-between">
									<span className="text-lg font-semibold">Tổng chi phí:</span>
									<div className="text-2xl font-bold text-gray-900">
										{convertStringToNumber(
											data.roomsSelected.reduce((room, number) => room + number.price * number.number * timeInfo.days, 0),
										)}
									</div>
								</div>
							</div>
							<Button
								color="primary"
								type="submit"
								className="mt-4 w-full"
								variant="shadow"
								isLoading={loading}
								isDisabled={timeInfo.hours < 24}
							>
								Đặt phòng
							</Button>
						</div>
					</div>
				</form>
			</FormProvider>
		</div>
	)
}