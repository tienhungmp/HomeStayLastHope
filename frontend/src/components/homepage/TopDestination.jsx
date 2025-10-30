import {RouterPath} from '@router/RouterPath'
import {PROVINCES} from '@utils/constants'
import {getDate} from '@utils/Utils'
import {useEffect, useState} from 'react'
import {factories} from '../../factory'
import useRouter from '../../hook/use-router'

function TopDestination() {
	const [routerTop, setRouter] = useState([])
	useEffect(() => {
		factories.getTopRouter().then(data => {
			setRouter(data?.trendingCities)
		})
	}, [])
	const router = useRouter()

	function handleSearch(city) {
		const newParams = {
			city: city,
			fromDate: getDate(new Date()),
			toDate: getDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
			roomQuantity: 1,
			capacity: 1,
			isWithPet: false,
			pricePerNight: '100000, 2000000',
		}
		router.push({
			pathname: RouterPath.SEARCH,
			params: newParams,
		})
	}

	return (
		<section className="container mx-auto pb-16">
			<h2 className="mb-2 text-2xl font-bold">Điểm đến đang thịnh hành</h2>
			<p className="mb-4 font-semibold text-content-secondary">Các lựa chọn phổ biến nhất cho du khách từ Việt Nam</p>
			<div className="flex flex-col gap-6">
				<div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{routerTop?.map((item, index) => (
						<div
							key={index}
							onClick={() => handleSearch(item?.city)}
							className="relative cursor-pointer overflow-hidden rounded-2xl"
						>
							<img
								src={PROVINCES?.find(x => x.id === item.city)?.src}
								alt={item?.city}
								className="aspect-[4/3] w-full object-cover"
							/>
							<div className="absolute inset-0 bg-black opacity-5"></div>
							<div className="absolute left-4 top-4 text-2xl font-bold text-white">
								{PROVINCES?.find(x => x.id === item.city)?.name}
								<span className="ml-1">🇻🇳</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default TopDestination
