import React from 'react'

export default function Review({review}) {
	return (
		<div className="border-b border-gray-200 py-4">
			<div className="flex items-start">
				<div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${review.avatarColor}`}>{review.initials}</div>
				<div className="ml-4 flex-1">
					<div className="flex items-center">
						<h3 className="font-bold">{review.name}</h3>
						<div className="ml-2 flex items-center">
							{[...Array(5)].map((_, i) => (
								<i
									key={i}
									className={`fa${i < review.rating ? 's' : 'r'} fa-star text-yellow-500`}
								></i>
							))}
						</div>
					</div>
					<p className="mt-1 text-gray-700">{review.text}</p>
					<div className="mt-2 flex items-center text-sm text-gray-500">
						<span>Đi ngày {review.date}</span>
						{review.purchased && (
							<span className="ml-2 flex items-center text-green-600">
								<i className="fas fa-check-circle mr-1"></i> Đã đặt phòng
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
