import StarIcon from '@assets/base/icon/Star'
import {Flex} from '@chakra-ui/react'
import {Accordion, AccordionItem, Button, Checkbox, Radio, RadioGroup, Slider} from '@nextui-org/react'
import {useEffect, useState} from 'react'
import useRouter from '../../hook/use-router'
import {AMENITIES, TYPE_HOST} from '../../utils/constants'

export default function SideBarSearch() {
	const [typeSort, setTypeSort] = useState()
	const [amenitiesSearch, setAmenitiesSearch] = useState([])
	const [rateCount, setRateCount] = useState()
	const [price, setPrice] = useState([100000, 2000000])
	const [typeAccommodation, setTypeAccommodation] = useState([])
	const router = useRouter()

	const {type} = router.getAll()
	useEffect(() => {
		if (type) {
			const numberArray = type?.split(',').map(item => parseInt(item, 10))
			setTypeAccommodation(numberArray)
		}
	}, [type])
	useEffect(() => {
		const newParams = {
			sort: typeSort,
			pricePerNight: `${price[0]},${price[1]}`,
			rate: rateCount,
		}
		if (amenitiesSearch.length > 0) {
			newParams.amenities = amenitiesSearch.join(',')
		}
		if (typeAccommodation.length > 0) {
			newParams.type = typeAccommodation.join(',')
		}
		router.replace(newParams)
	}, [typeSort, rateCount])

	const handleSearch = () => {
		const newParams = {
			sort: typeSort,
			pricePerNight: `${price[0]},${price[1]}`,
			amenities: amenitiesSearch.join(','),
			type: typeAccommodation.join(','),
		}
		router.replace(newParams)
	}

	function handleChangeAmenity(value) {
		if (amenitiesSearch.includes(value)) {
			setAmenitiesSearch(amenitiesSearch.filter(item => item !== value))
		} else {
			setAmenitiesSearch([...amenitiesSearch, value])
		}
	}

	function handleChangeType(value) {
		if (typeAccommodation.includes(value)) {
			setTypeAccommodation(typeAccommodation.filter(item => item !== value))
		} else {
			setTypeAccommodation([...typeAccommodation, value])
		}
	}

	return (
		<div className="px-2">
			<div className="w-64">
				<div className="flex flex-col rounded-t-lg border border-b-0 p-4">
					<h2 className="mb-2 font-bold">Sắp xếp:</h2>
					<div className="mb-0">
						<RadioGroup
							defaultValue="S1"
							onChange={e => setTypeSort(e.target.value)}
						>
							<Radio
								key="1"
								value="S1"
							>
								Đánh giá cao nhất
							</Radio>
							<Radio
								key="3"
								value="S2"
							>
								Giá tăng dần
							</Radio>
							<Radio
								key="4"
								value="S3"
							>
								Giá giảm dần
							</Radio>
						</RadioGroup>
					</div>
				</div>
				<div className="border border-b-0 p-4">
					<h3 className="mb-4 font-semibold">Ngân sách của bạn:</h3>
					<Slider
						step={50}
						label="Giá"
						minValue={100000}
						maxValue={2000000}
						defaultValue={[100000, 2000000]}
						onChange={setPrice}
						formatOptions={{style: 'currency', currency: 'VND'}}
						className="max-w-md"
					/>
					<Flex
						justify={'flex-end'}
						marginTop={1}
					>
						<Button onClick={() => handleSearch()}>Áp dụng</Button>
					</Flex>
				</div>
				<div className="mb-4 rounded-b-lg border px-4 py-4">
					<h3 className="font-semibold">Bộ lọc:</h3>
					<Accordion
						className="px-0"
						variant="light"
						open
					>
						<AccordionItem
							key="1.1"
							title="Loại chỗ nghỉ"
						>
							<div className="flex flex-col gap-1">
								{TYPE_HOST.map(x => (
									<Checkbox
										onChange={e => handleChangeType(x.id)}
										value={x.id}
										isSelected={typeAccommodation.includes(x.id)}
									>
										{x.name}
									</Checkbox>
								))}
								<Button onClick={() => handleSearch()}>Áp dụng</Button>
							</div>
						</AccordionItem>
						<AccordionItem
							key="3.3"
							title="Tiêu chí phổ biến"
						>
							<div className="flex flex-col gap-1">
								{AMENITIES.map(x => (
									<Checkbox
										value={x.id}
										isSelected={amenitiesSearch.includes(x.id)}
										onChange={e => handleChangeAmenity(e.target.value)}
									>
										{x.title}
									</Checkbox>
								))}
								<Flex
									justify="end"
									marginTop={1}
								></Flex>
								<Button onClick={() => handleSearch()}>Áp dụng</Button>
							</div>
						</AccordionItem>

						<AccordionItem
							key="5"
							title="Đánh giá"
						>
							<div className="flex w-3/4 flex-col gap-1">
								<Button
									variant="ghost flex-start"
									className="flex-start"
									onClick={() => setRateCount(5)}
								>
									<StarIcon />
									<StarIcon />
									<StarIcon />
									<StarIcon />
									<StarIcon />
								</Button>
								<Button
									variant="ghost flex-start"
									className="flex-start"
									onClick={() => setRateCount(4)}
								>
									<StarIcon />
									<StarIcon />
									<StarIcon />
									<StarIcon />
								</Button>
								<Button
									variant="ghost flex-start"
									onClick={() => setRateCount(3)}
									className="flex-start"
								>
									<StarIcon />
									<StarIcon />
									<StarIcon />
								</Button>
								<Button
									variant="ghost flex-start"
									onClick={() => setRateCount(2)}
									className="flex-start"
								>
									<StarIcon />
									<StarIcon />
								</Button>
								<Button
									variant="ghost flex-start"
									onClick={() => setRateCount(1)}
									className="flex-start"
								>
									<StarIcon />
								</Button>
								<Button
									color="default"
									// variant="flex-start"
									onClick={() => setRateCount('')}
									className="font-bold"
								>
									Bỏ bộ lọc đánh giá
								</Button>
							</div>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
		</div>
	)
}
