import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {useEffect, useState} from 'react'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'

delete L.Icon.Default.prototype._getIconUrl

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
})

// eslint-disable-next-line react/prop-types
export default function MapView({isMine = false, lat, lng, zoomIn: zoom = 15, height = '400px', width = '300px'}) {
	const [position, setPosition] = useState(null)

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const {latitude, longitude} = position.coords
					setPosition([latitude, longitude])
				},
				error => {
					console.error('Không thể lấy vị trí:', error)
				},
			)
		} else {
			console.error('Trình duyệt của bạn không hỗ trợ Geolocation')
		}
	}

	useEffect(() => {
		// getCurrentLocation()
	}, [])

	return (
		<>
			<MapContainer
				center={isMine ? position : [lat, lng]}
				zoom={zoom}
				style={{height: height, width: width, borderRadius: 16}}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>
				<Marker position={isMine ? position : [lat, lng]}>
					<Popup>Đây là vị trí hiện tại của bạn!</Popup>
				</Marker>
			</MapContainer>
		</>
	)
}
