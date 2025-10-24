import axios from 'axios'

// Factory để tạo hàm tải ảnh lên Imgur
const clientId = '2b117c1cfc6c06c'

// Hàm upload ảnh lên Imgur
export const uploadImageToImgur = async imageFile => {
	const form = new FormData()
	form.append('image', imageFile) // Append file ảnh vào form

	try {
		const response = await axios.post('https://api.imgur.com/3/image', form, {
			headers: {
				Authorization: `Client-ID ${clientId}`, // Thêm Client ID vào header
			},
		})

		// Kiểm tra kết quả trả về và trả về URL nếu upload thành công
		if (response.data.success) {
			return response.data.data.link // Trả về URL ảnh đã upload
		} else {
			throw new Error('Error uploading image: ' + response.data.status)
		}
	} catch (error) {
		console.error('Error uploading image:', error)
		throw error
	}
}
