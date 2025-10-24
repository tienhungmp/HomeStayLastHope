export const AMENITIES_ROOM = [
	{
		id: '1',
		title: 'Phòng tắm',
		icon: () => <i className="fa fa-bath"></i>,
		items: [
			{id: '1.1', title: 'Giấy vệ sinh'},
			{id: '1.2', title: 'Khăn tắm'},
			{id: '1.3', title: 'Phòng tắm phụ'},
			{id: '1.4', title: 'Chậu rửa vệ sinh (bidet)'},
			{id: '1.5', title: 'Bồn tắm hoặc Vòi sen'},
			{id: '1.6', title: 'Dép'},
			{id: '1.7', title: 'Phòng tắm riêng'},
			{id: '1.8', title: 'Nhà vệ sinh'},
			{id: '1.9', title: 'Đồ vệ sinh cá nhân miễn phí'},
			{id: '1.10', title: 'Máy sấy tóc'},
			{id: '1.11', title: 'Vòi sen'},
		],
	},
	{
		id: '8',
		title: 'Đồ ăn & thức uống',
		icon: () => (
			<i
				className="fa fa-leaf"
				aria-hidden="true"
			></i>
		),
		items: [
			{id: '8.1', title: 'Trái cây (Phụ phí)'},
			{id: '8.2', title: 'Rượu vang/sâm panh (Phụ phí)'},
			{id: '8.3', title: 'Bữa ăn tự chọn phù hợp với trẻ em'},
			{id: '8.4', title: 'Bữa ăn trẻ em (Phụ phí)'},
			{id: '8.5', title: 'Thực đơn ăn kiêng đặc biệt (theo yêu cầu)'},
			{id: '8.6', title: 'Bữa sáng tại phòng'},
			{id: '8.7', title: 'Minibar'},
			{id: '8.8', title: 'Nhà hàng'},
			{id: '8.9', title: 'Máy pha trà/cà phê'},
		],
	},
	{
		id: '6',
		title: 'Khu vực phòng khách',
		icon: () => <i className="fa fa-home"></i>,
		items: [
			{id: '6.1', title: 'Lò sưởi'},
			{id: '6.2', title: 'Khu vực tiếp khách'},
			{id: '6.3', title: 'Bàn làm việc'},
		],
	},
	{
		id: '3',
		title: 'Tầm nhìn',
		icon: () => <i className="fa fa-landmark"></i>,
		items: [
			{id: '3.1', title: 'Nhìn ra thành phố'},
			{id: '3.2', title: 'Nhìn ra địa danh nổi tiếng'},
			{id: '3.3', title: 'Tầm nhìn ra khung cảnh'},
		],
	},
	{
		id: '4',
		title: 'Ngoài trời',
		icon: () => <i className="fa fa-seedling"></i>,
		items: [
			{id: '4.1', title: 'Bàn ghế ngoài trời'},
			{id: '4.2', title: 'Sân hiên phơi nắng'},
			{id: '4.3', title: 'Hồ bơi riêng'},
			{id: '4.4', title: 'Tiện nghi BBQ (Phụ phí)'},
			{id: '4.5', title: 'Sân thượng / hiên'},
		],
	},
	{
		id: '7',
		title: 'Truyền thông & Công nghệ',
		icon: () => <i className="fa fa-television"></i>,
		items: [
			{id: '7.1', title: 'TV màn hình phẳng'},
			{id: '7.2', title: 'Truyền hình cáp'},
			{id: '7.3', title: 'Truyền hình vệ tinh'},
			{id: '7.4', title: 'Điện thoại'},
			{id: '7.5', title: 'TV'},
		],
	},
	{
		id: '5',
		title: 'Nhà bếp',
		icon: () => <i className="fa fa-utensils"></i>,
		items: [
			{id: '5.1', title: 'Ấm đun nước điện'},
			{id: '5.2', title: 'Tủ lạnh'},
		],
	},
	{
		id: '2',
		title: 'Phòng ngủ',
		icon: () => <i className="fa fe-bed"></i>,
		items: [
			{id: '2.1', title: 'Ra trải giường'},
			{id: '2.2', title: 'Tủ hoặc phòng để quần áo'},
		],
	},
	{
		id: '9',
		title: 'Internet',
		icon: () => <i className="fa fa-wifi"></i>,
		items: [{id: '9.1', title: 'Wi-fi miễn phí'}],
	},
	{
		id: '10',
		title: 'Chỗ đậu xe',
		icon: () => <i className="fa fa-product-hunt"></i>,
		items: [{id: '10.1', title: 'Có chỗ đỗ xe'}],
	},
	{
		id: '13',
		title: 'Tổng quát',
		icon: () => <i className="fa fa-info-circle"></i>,
		items: [
			{id: '13.1', title: 'Dịch vụ đưa đón (Phụ phí)'},
			{id: '13.2', title: 'Bát ăn cho vật nuôi'},
			{id: '13.3', title: 'Chỗ ngủ cho vật nuôi'},
			{id: '13.4', title: 'Giao nhận đồ tạp hóa (Phụ phí)'},
			{id: '13.5', title: 'Khu vực xem TV/sành chung'},
			{id: '13.6', title: 'Không gây dị ứng'},
			{id: '13.7', title: 'Khu vực cho phép hút thuốc'},
			{id: '13.8', title: 'Điều hòa nhiệt độ'},
			{id: '13.9', title: 'Phòng không gây dị ứng'},
			{id: '13.10', title: 'Màn chống muỗi'},
		],
	},

	{
		id: '12',
		title: 'Dịch vụ lễ tân',
		icon: () => <i className="fa fa-wifi"></i>,
		items: [
			{
				id: '12.1',
				title: 'Có xuất hóa đơn',
			},
			{
				id: '12.2',
				title: 'Tủ khóa',
			},
			{
				id: '12.3',
				title: 'Thu đổi ngoại tệ',
			},
			{
				id: '12.4',
				title: 'Lễ tân 24 giờ',
			},
			{
				id: '12.5',
				title: 'Giữ hành lín',
			},
		],
	},
]

export const amenitiesSearchConst = [
	{id: '3.1', title: 'Nhìn ra thành phố'},
	{id: '3.2', title: 'Nhìn ra địa danh nổi tiếng'},
	{id: '4.1', title: 'Bàn ghế ngoài trời'},
	{id: '4.3', title: 'Hồ bơi riêng'},
	{id: '8.7', title: 'Minibar'},
	{id: '8.8', title: 'Nhà hàng'},
	{id: '8.9', title: 'Máy pha trà/cà phê'},
	{id: '10.1', title: 'Có chỗ đỗ xe'},
	{
		id: '12.1',
		title: 'Có xuất hóa đơn',
	},
	{id: '13.1', title: 'Dịch vụ đưa đón (Phụ phí)'},
	{id: '13.3', title: 'Chỗ ngủ cho vật nuôi'},
	{
		id: '12.4',
		title: 'Lễ tân 24 giờ',
	},
	{id: '9.1', title: 'Wi-fi miễn phí'},
]
