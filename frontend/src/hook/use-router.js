import {useLocation, useNavigate} from 'react-router-dom'

function useRouter() {
	const navigate = useNavigate()
	const {pathname, search} = useLocation()

	// Lấy giá trị của một tham số trong URL
	const get = field => {
		const params = new URLSearchParams(search)
		return params.get(field)
	}

	// Lấy tất cả các tham số hiện tại trong URL
	const getAll = () => {
		const params = new URLSearchParams(search)
		const result = {}
		for (const [key, value] of params.entries()) {
			result[key] = value
		}
		return result
	}

	// Thay thế URL hiện tại với các tham số mới
	const replace = (params = {}) => {
		const currentParams = new URLSearchParams(search)
		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				currentParams.delete(key) // Xóa tham số nếu giá trị null/undefined
			} else {
				currentParams.set(key, value) // Thêm/cập nhật tham số
			}
		})
		navigate(`${pathname}?${currentParams.toString()}`, {replace: true})
	}

	// Điều hướng đến một URL mới với các tham số
	const push = ({pathname: newPath = pathname, params = {}}) => {
		const newParams = new URLSearchParams()
		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				newParams.set(key, value)
			}
		})
		navigate(`${newPath}?${newParams.toString()}`)
	}

	// Quay lại trang trước đó
	const goBack = () => {
		navigate(-1)
	}

	return {
		get,
		getAll,
		replace,
		push,
		goBack,
	}
}

export default useRouter
