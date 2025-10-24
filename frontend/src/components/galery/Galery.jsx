import {Image} from '@nextui-org/react'
import React, {useState} from 'react'

const ImageGallery = ({images}) => {
	const [currentIndex, setCurrentIndex] = useState(0)

	// Hàm chuyển ảnh
	const handlePrev = () => {
		setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
	}

	const handleNext = () => {
		setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
	}

	const handleThumbnailClick = index => {
		setCurrentIndex(index)
	}

	return (
		<div className="flex w-full flex-col justify-center text-center">
			<div className="relative inline-block">
				<img
					src={images[currentIndex]}
					alt={`Image ${currentIndex + 1}`}
					className="aspect-video h-full w-full rounded-lg border object-cover"
				/>
				<button
					onClick={handlePrev}
					className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-700 px-2 py-2 text-lg text-white opacity-50 hover:bg-gray-800"
				>
					❮
				</button>
				<button
					onClick={handleNext}
					className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-700 px-2 py-2 text-lg text-white opacity-50 hover:bg-gray-800"
				>
					❯
				</button>
			</div>

			<div className="mt-4 flex w-full justify-center gap-2">
				{images.map((src, index) => (
					<Image
						key={index}
						src={src}
						alt={`Thumbnail ${index + 1}`}
						onClick={() => handleThumbnailClick(index)}
						className={`h-16 w-24 cursor-pointer border-2 object-cover ${currentIndex === index ? 'border-black' : 'border-transparent'}`}
					/>
				))}
			</div>
		</div>
	)
}

export default ImageGallery
