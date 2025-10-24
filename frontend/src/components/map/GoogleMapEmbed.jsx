import React, {useEffect, useState} from 'react'

export default function GoogleMapEmbed({latitude, longitude}) {
	const [mapSrc, setMapSrc] = useState('')

	useEffect(() => {
		// Construct the Google Maps embed URL with dynamic latitude and longitude
		const newMapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1532.1602329155778!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219d375b7e36d%3A0x87a589eecb31e2cd!2sMeli%C3%A1%20Vinpearl%20Danang%20Riverfront!5e0!3m2!1sen!2s!4v1729361376912!5m2!1sen!2s`
		setMapSrc(newMapSrc)
	}, [latitude, longitude]) // Dependencies array

	return (
		<iframe
			src={mapSrc}
			width="600"
			height="450"
			style={{border: 0}}
			allowFullScreen=""
			loading="lazy"
			referrerPolicy="no-referrer-when-downgrade"
			title="Google Map"
		/>
	)
}
