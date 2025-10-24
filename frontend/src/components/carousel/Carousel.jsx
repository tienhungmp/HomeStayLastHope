import React, {useState} from 'react'

export default function Carousel({children, pressNext, pressPrev, itemsPerSlide = 3, cardWidth = 280}) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const totalItems = React.Children.count(children)
	const maxIndex = Math.ceil(totalItems / itemsPerSlide) - 1

	const handlePrev = () => {
		if (currentIndex > 0) {
			const newIndex = currentIndex - 1
			setCurrentIndex(newIndex)
			if (pressPrev) pressPrev(newIndex)
		}
	}

	const handleNext = () => {
		if (currentIndex < maxIndex) {
			const newIndex = currentIndex + 1
			setCurrentIndex(newIndex)
			if (pressNext) pressNext(newIndex)
		}
	}

	const totalWidth = totalItems * cardWidth

	return (
		<div className="relative mx-auto w-full">
			<div className="w-full overflow-hidden">
				<div
					className="flex transition-transform duration-300"
					style={{
						transform: `translateX(-${currentIndex * cardWidth * itemsPerSlide}px)`, // Dịch chuyển theo chiều rộng của card
						width: `${totalWidth}px`, // Tổng chiều rộng cho tất cả các item
					}}
				>
					{React.Children.map(children, (child, index) => (
						<div
							key={index}
							style={{width: `${cardWidth}px`}} // Chiều rộng của mỗi card
							className="flex-shrink-0" // Không cho phép phần tử co lại
						>
							{child}
						</div>
					))}
				</div>
			</div>

			<div className="absolute inset-0 flex items-center justify-center">
				<button
					onClick={handlePrev}
					className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-gray-700 bg-opacity-50 px-2 py-2 text-white"
				>
					<i className="fas fa-chevron-left"></i>
				</button>
			</div>
			<div className="absolute inset-0 flex items-center justify-center">
				<button
					onClick={handleNext}
					className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-700 bg-opacity-50 px-2 py-2 text-white"
				>
					<i className="fas fa-chevron-right"></i>
				</button>
			</div>
		</div>
	)
}
