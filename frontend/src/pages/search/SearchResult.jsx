import {Button, Chip} from '@nextui-org/react'
import {RouterPath} from '@router/RouterPath'
import {convertStringToNumber} from '@utils/Utils'

import {Flex} from '@chakra-ui/react'
import {useEffect, useMemo, useState} from 'react'
import Loading from '../../components/loading/Loading'
import {factories} from '../../factory'
import useRouter from '../../hook/use-router'
import {AMENITIES, SORT_TYPE, TYPE_HOST} from '../../utils/constants'

export default function SearchResult() {
	const router = useRouter()
	const {
		city,
		fromDate,
		toDate,
		capacity,
		roomQuantity,
		isWithPet,
		rate,
		amenities = '',
		pricePerNight,
		page = 1,
		limit = 10,
		sort,
		type,
	} = router.getAll()
	const [loading, setLoading] = useState(false)
	const [newPage, setPage] = useState()
	const [data, setData] = useState([])

	const price = useMemo(() => {
		return pricePerNight.split(',')
	}, [pricePerNight])

	useEffect(() => {
		setLoading(true)
		const newData = {
			city,
			fromDate: fromDate,
			toDate: toDate,
			capacity: capacity,
			type,
			sort,
			rate,
			roomQuantity: roomQuantity,
			isWithPet: isWithPet,
			pricePerNight: pricePerNight,
			amenities: amenities,
			page: newPage,
			limit: 100,
		}
		factories
			.getAccommodations(newData)
			.then(data => setData(data))
			.finally(() => setLoading(false))
	}, [city, rate, fromDate, toDate, type, capacity, roomQuantity, isWithPet, amenities, pricePerNight, sort, limit])

	return (
		<div className="flex w-full flex-col gap-2">
			<p className="text-2xl font-bold">Tìm thấy: {data?.accommodations?.length ?? 0} chỗ nghỉ</p>
			<div className="mb-2 flex flex-wrap gap-2">
				{sort && (
					<Chip
						color="success"
						className="text-white"
					>
						{SORT_TYPE.find(x => x.value === sort)?.label ?? 'Sắp xếp'}
					</Chip>
				)}

				{/* Loại chỗ nghĩ */}
				{type?.split(',')?.map((item, index) => {
					const data = TYPE_HOST.find(x => x.id.toString() === item)?.name
					if (data) {
						return (
							<Chip
								key={index}
								color="primary"
								className="text-white"
							>
								{data}
							</Chip>
						)
					}
					return null
				})}
				{/* Tiện nghi */}
				{amenities?.split(',')?.map((item, index) => {
					const data = AMENITIES.find(x => x.id === item)?.title
					if (data) {
						return (
							<Chip
								key={index}
								color="success"
								className="text-white"
							>
								{data}
							</Chip>
						)
					}
					return null
				})}
				<Chip
					color="warning"
					className="text-white"
				>
					Giá: {convertStringToNumber(price[0])} - {convertStringToNumber(price[1])}
				</Chip>
			</div>
			{!loading ? (
				<div className="flex w-full flex-col gap-5">
					{data?.accommodations?.map(x => (
						<CardSearch
							key={x._id}
							item={x}
						/>
					))}
					{/* <PaginationCustom
						total={data?.pagination?.total}
						onChange={setPage}
					/> */}
				</div>
			) : (
				<Loading />
			)}
		</div>
	)
}

function CardSearch({item}) {
	const router = useRouter()
	const isHomestay = Number(item.type) <= 3
	return (
		<div className="flex w-full flex-col rounded-lg border bg-white p-4 hover:shadow-xl">
			<div className="flex w-full">
				<div className="relative">
					<img
						src={
							item?.images[0] ||
							'https://cf.bstatic.com/xdata/images/hotel/square240/619341232.webp?k=7887c694275fc4c37189071e70c9b3193ba6dfab928f1248f471ee8896113163&o='
						}
						alt="image"
						className="aspect-square h-52 w-52 rounded-md"
					/>
				</div>
				<div className="ml-4 flex-1">
					<div className="flex justify-between">
						<div>
							<Flex
								alignItems={'center'}
								gap={2}
							>
								<h2 className="text-lg font-extrabold text-blue-600">{item?.name}</h2>
								<p className="text-[10px] text-sm font-bold text-blue-500">{TYPE_HOST.find(x => x.id === item.type)?.name ?? 'Loại'}</p>
							</Flex>
							<div className="flex w-full gap-2">
								<p className="max-w-[330px] text-left text-[10px] font-bold text-blue-400 underline">{item.address}</p>
							</div>
						</div>
						<div className="flex items-center justify-center gap-2">
							{item?.averageRating > 0 ? (
								<>
									<div className="flex flex-col items-end">
										<p className="text-[14px] font-bold">
											{item?.averageRating >= 4.5
												? 'Rất tốt'
												: item?.averageRating >= 4
													? 'Tốt'
													: item?.averageRating >= 3
														? 'Bình thường'
														: 'Kém'}
										</p>
										<p className="text-[12px] text-gray-600">{item?.totalReviews ?? 0} đánh giá</p>
									</div>
									<div className="flex items-center text-sm text-gray-500">
										<span className="rounded-md bg-blue-700 px-1 py-1 text-white">{item?.averageRating?.toFixed(1) ?? 0}</span>
									</div>
								</>
							) : (
								<p className="text-[12px] text-gray-600">Chưa có đánh giá</p>
							)}
						</div>
					</div>

					<div className="mt-2">
						{isHomestay ? (
							<div className="flex items-center justify-between">
								<div className="flex flex-col justify-center text-sm">
									<div
										className="overflow-hidden text-justify font-medium"
										style={{maxHeight: '100px', minWidth: '620px'}}
									>
										<div className="overflow-hidden overflow-ellipsis whitespace-normal">
											<div dangerouslySetInnerHTML={{__html: item?.description}} />
										</div>
									</div>
								</div>
								<div className="flex flex-col justify-end">
									<p className="text-end font-bold">
										{convertStringToNumber(isHomestay ? item?.pricePerNight : item?.rooms?.[0].pricePerNight)}
									</p>
									<p className="text-end text-[9px]">{'Đã bao gồm thuế và phí'}</p>
								</div>
							</div>
						) : (
							<>
								<div className="flex items-center justify-between">
									<p className="mt-1 w-fit rounded-lg border p-2 py-0 text-sm">Phòng được đề xuất cho bạn</p>
									<p className="w-fit py-0 text-[10px]">1 đêm, {item?.rooms?.[0]?.capacity} người</p>
								</div>
								{item?.rooms?.[0] && (
									<div className="flex h-full items-center gap-4">
										<div className="ml-4 flex flex-grow justify-between">
											<div className="flex flex-col justify-center text-sm">
												<div className="mt-2 flex">
													<div className="font-bold">{item?.rooms?.[0].name}</div>
												</div>
												<div
													className="overflow-hidden text-justify font-medium"
													style={{maxHeight: '100px', minWidth: '220px'}}
												>
													<div className="overflow-hidden overflow-ellipsis whitespace-normal">
														<div dangerouslySetInnerHTML={{__html: item?.rooms?.[0].description}} />
													</div>
												</div>
											</div>
											<div className="item-end flex min-w-[140px] flex-col justify-end">
												<p className="text-end font-bold">
													{convertStringToNumber(isHomestay ? item?.pricePerNight : item?.rooms?.[0].pricePerNight)}
												</p>
												<p className="text-end text-[9px]">{'Đã bao gồm thuế và phí'}</p>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
			<div className="mb-2 mt-0 flex w-full items-center justify-between">
				<div className="flex flex-col">
					<div className="text-content text-lg font-bold">{item?.amenities.includes('F1') && 'KHÔNG CẦN THANH TOÁN TRƯỚC'}</div>
				</div>
				<div className="flex flex-col items-end gap-2">
					<Button
						variant="shadow"
						color="warning"
						className="text-white"
						onClick={() => {
							router.push({
								pathname: `${RouterPath.DETAIL}/${item._id}`,
							})
						}}
					>
						Xem phòng trống
					</Button>
				</div>
			</div>
		</div>
	)
}
