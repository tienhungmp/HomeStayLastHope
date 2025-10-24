import {getGGMapLink} from '@utils/Utils'

export default function GoogleMapLink({lat, lng}) {
	const mapUrl = getGGMapLink(lat, lng)
	// `https://www.google.com/maps?q=${lat},${lng}`
	return (
		<a
			href={mapUrl}
			target="_blank"
			className="flex w-fit items-center bg-blue-500 px-2 py-1 text-sm font-bold text-white"
			rel="noopener noreferrer"
		>
			Xem trên Google Maps
		</a>
	)
}
