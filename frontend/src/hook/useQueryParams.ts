import {useLocation} from 'react-router-dom'

export default function useQueryParams() {
	const {search} = useLocation() // Lấy query string từ URL
	const queryParams = new URLSearchParams(search)

	// Tạo một object từ tất cả các tham số trong query string
	const params = {}
	queryParams.forEach((value, key) => {
		// Chuyển các giá trị 'true' thành boolean true, 'false' thành boolean false
		if (value === 'true') {
			params[key] = true
		} else if (value === 'false') {
			params[key] = false
		} else {
			params[key] = value
		}
	})

	return params
}
