import {RouterPath} from '@router/RouterPath'
import {PROVINCES} from '@utils/constants'
import {convertStringToNumber} from '@utils/Utils'
import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'

function SuggestionAI() {
	const [list, setList] = useState([])
	const {auth} = useAuth()
	useEffect(() => {
		if (!auth) return
		factories
			.getRecommend({
				id: auth._id,
			})
			.then(data => {
				setList(data.recommendations)
			})
	}, [auth])
	if (!auth) return <div className="mt-10"></div>
	return (
		<div>
			<section className="container mx-auto py-16">
				<h2 className="mb-8 text-2xl font-extrabold">Bạn có quan tâm đến những chỗ nghỉ này?</h2>
				{list.length < 1 && <div className="mt-0 w-full">Nhận nhiều gợi ý các phòng phù hợp hơn khi đặt phòng</div>}
				<div className="grid grid-cols-3 gap-8">
					{list.length > 1 &&
						list.map(item => (
							<CardDestination
								name="Da Nang Resort"
								room={item?.name}
								src={item?.accommodationId?.images?.[0] || images?.[0]}
								province={item?.accommodationId?.city}
								accommodationId={item.accommodationId._id}
								price={item?.pricePerNight}
							/>
						))}
				</div>
			</section>
		</div>
	)
}

export default SuggestionAI

function CardDestination({name, room, src, price = 8.9, province, accommodationId}) {
	return (
		<Link
			to={`${RouterPath.DETAIL}/${accommodationId}`}
			className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-100 ease-in-out hover:scale-105 hover:shadow-2xl"
		>
			<img
				alt={`r_${name}`}
				className="h-48 w-full object-cover"
				src={src ? src : 'https://placehold.co/400x300'}
			/>
			<div className="p-4">
				<h3 className="text-xl font-bold">{room}</h3>
				<h3 className="text-sm font-bold">{name}</h3>
				<div className="mt-2 flex items-center justify-between">
					<p className="font-bold text-gray-600">{PROVINCES.find(i => i.id === province)?.name}</p>
					<span className="rounded-md bg-blue-600 px-2 py-1 text-sm text-white">{convertStringToNumber(price)}</span>
				</div>
			</div>
		</Link>
	)
}
