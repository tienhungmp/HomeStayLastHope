import {RouterPath} from '@router/RouterPath'
import {getDate} from '@utils/Utils'
import useRouter from '../../hook/use-router'

function SuggestionByCategories() {
	const router = useRouter()

	function handleSearch(type) {
		const newParams = {
			city: '21',
			type: type,
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
			<h1 className="mb-8 text-2xl font-extrabold">Tìm theo loại chỗ nghỉ</h1>
			<div className="flex flex-wrap gap-4">
				<div
					className="w-full flex-1 cursor-pointer text-center"
					onClick={() => handleSearch(4)}
				>
					<img
						src="https://r-xx.bstatic.com/xdata/images/xphoto/263x210/57584488.jpeg?k=d8d4706fc72ee789d870eb6b05c0e546fd4ad85d72a3af3e30fb80ca72f0ba57&o="
						alt="Khách sạn"
						className="mb-2 aspect-[3/2] w-full rounded-lg"
					/>
					<p className="text-center text-xl font-bold">Khách sạn</p>
				</div>
				<div
					className="w-full flex-1 cursor-pointer text-center"
					onClick={() => handleSearch(1)}
				>
					<img
						src="https://r-xx.bstatic.com/xdata/images/hotel/263x210/119467716.jpeg?k=f3c2c6271ab71513e044e48dfde378fcd6bb80cb893e39b9b78b33a60c0131c9&o=330x250"
						alt="Căn hộ"
						className="mb-2 aspect-[3/2] w-full rounded-lg"
					/>
					<p className="text-center text-xl font-bold">Căn hộ</p>
				</div>
				<div
					className="w-full flex-1 cursor-pointer text-center"
					onClick={() => handleSearch(5)}
				>
					<img
						src="https://r-xx.bstatic.com/xdata/images/xphoto/263x210/45450084.jpeg?k=f8c2954e867a1dd4b479909c49528531dcfb676d8fbc0d60f51d7b51bb32d1d9&o="
						alt="Các resort"
						className="mb-2 aspect-[3/2] w-full rounded-lg"
					/>
					<p className="text-center text-xl font-bold">Nhà nghỉ</p>
				</div>
				<div
					className="w-full flex-1 cursor-pointer text-center"
					onClick={() => handleSearch(3)}
				>
					<img
						src="https://r-xx.bstatic.com/xdata/images/hotel/263x210/100235855.jpeg?k=5b6e6cff16cfd290e953768d63ee15f633b56348238a705c45759aa3a81ba82b&o="
						alt="Các biệt thự"
						className="mb-2 aspect-[3/2] w-full rounded-lg"
					/>
					<p className="text-center text-xl font-bold">Các biệt thự</p>
				</div>
			</div>
		</section>
	)
}

export default SuggestionByCategories
