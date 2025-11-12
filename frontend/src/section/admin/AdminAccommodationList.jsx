import {CustomTable} from '@components/custom-table/CustomTable'
import {Button, Input} from '@nextui-org/react'
import {PROVINCES, ROLES, TYPE_HOST} from '@utils/constants'
import {getBranchId} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory/index'
import CreateAccommodationModal from './modal/CreateAccommodationModal'
import EditPolicyModal from './modal/EditPolicy'

// New modal to show available rooms
function AvailableRoomsModal({accommodationId}) {
	const [rooms, setRooms] = useState([])
	const [loading, setLoading] = useState(true)
	const [checkIn, setCheckIn] = useState('')
	const [checkOut, setCheckOut] = useState('')

	useEffect(() => {
		if (checkIn && checkOut) {
			factories.getAvailableRooms({accommodationId, checkInDate: checkIn, checkOutDate: checkOut})
				.then(res => setRooms(res.availableRooms || []))
				.finally(() => setLoading(false))
		}
	}, [checkIn, checkOut, accommodationId])

	return (
		<div className="p-4">
			<div className="mb-4 flex gap-3">
				<Input
					type="date"
					label="Check-in"
					value={checkIn}
					onChange={e => setCheckIn(e.target.value)}
				/>
				<Input
					type="date"
					label="Check-out"
					value={checkOut}
					onChange={e => setCheckOut(e.target.value)}
				/>
			</div>
			{loading && <div className="text-center">Loading...</div>}
			{!loading && rooms.length === 0 && <div className="text-center text-gray-500">No rooms found</div>}
			<div className="space-y-3">
				{rooms.map(r => (
					<div key={r.roomId} className="rounded border p-3">
						<div className="flex justify-between">
							<span className="font-semibold">{r.roomName}</span>
							<span className={`${r.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
								{r.availableQuantity} available
							</span>
						</div>
						<div className="text-sm text-gray-600">
							Capacity: {r.capacity} | Total: {r.totalQuantity} | Booked: {r.bookedQuantity}
						</div>
						<div className="text-sm text-gray-600">Price: {r.pricePerNight.toLocaleString()} VND/night</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default function AdminAccommodationList() {
	const [keyword, setKeyword] = useState()
	const [data, setData] = useState([])
	const [pagination, setPagination] = useState()
	const {auth} = useAuth()
	const [loading, setLoading] = useState(true)
	const {onOpen} = useModalCommon()
	useEffect(() => {
		loadList()
	}, [keyword, pagination?.current])

	const columns = [
		{
			id: 'name',
			label: 'Tên chỗ nghỉ',
			renderCell: row => <div className="w-44">{row?.name}</div>,
		},
		{
			id: 'name',
			label: 'Tên chủ nhà',
			renderCell: row => <div className="w-44">{row?.host?.fullName}</div>,
		},
		{
			id: 'type',
			label: 'Loại hình',
			renderCell: row => <div className="">{TYPE_HOST.find(x => x.id === row.type)?.name}</div>,
		},
		{
			id: 'city',
			label: 'Thành phố',
			renderCell: row => <div className="">{PROVINCES.find(x => x.id == row.city)?.name}</div>,
		},
		{
			id: 'address',
			label: 'Địa chỉ',
			renderCell: row => <div className="">{row?.address}</div>,
		},
		{
			id: 'action',
			label: 'Tác vụ',
			headCell: () => <span className="w-full text-center">Tác vụ</span>,
			renderCell: row => (
				<div className="w-48 flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 border-none"
						onClick={() => editAcmd(row)}
					>
						<i className="fas fa-pen text-sm text-gray-400"></i>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 border-none"
						onClick={() => showAvailableRooms(row)}
					>
						<i className="fas fa-bed text-sm text-blue-500"></i>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 border-none"
						onClick={() => toggleVisibility(row)}
					>
						<i className={`fas ${row.isVisible ? 'fa-eye text-green-500' : 'fa-eye-slash text-gray-400'}`}></i>
					</Button>
				</div>
			),
		},
	]

	function createAcmd() {
		onOpen({
			view: <CreateAccommodationModal onReload={loadList} />,
			title: 'Tạo chỗ nghỉ mới',
			size: '2xl',
		})
	}
	function editAcmd(row) {
		onOpen({
			view: (
				<CreateAccommodationModal
					onReload={loadList}
					item={row}
				/>
			),
			title: 'Cập nhật chỗ nghỉ',
			size: '2xl',
		})
	}

	function editPolicy(row) {
		onOpen({
			view: <EditPolicyModal onReload={loadList} />,
			title: 'Chỉnh sửa chính sách',
			size: '2xl',
		})
	}

	function showAvailableRooms(row) {
		onOpen({
			view: <AvailableRoomsModal accommodationId={row._id} />,
			title: `Available rooms - ${row.name}`,
			size: '2xl',
		})
	}

	async function toggleVisibility(row) {
		try {
			await factories.updateAccommodationVisibility({
				id: row.id,
				isVisible: !row.isVisible,
			})
			loadList()
		} catch (error) {
			console.error('Failed to toggle visibility:', error)
		}
	}

	function loadList() {
		setLoading(true)
		const params = {
			...(getBranchId(auth) && {ownerId: getBranchId(auth)}),
			page: pagination?.current,
			...(keyword ? {keyword} : {}),
		}
		factories
			.getAdminListAccommodation(params)
			.then(data => {
				setData(data?.accommodations)
				setLoading(false)
				setPagination(data.pagination)
			})
			.finally(() => setLoading(false))
	}
	return (
		<div className="h-full rounded bg-white px-4 py-3 shadow-md">
			<div className="flex flex-row items-center justify-between gap-4">
				<Input
					type="text"
					onChange={e => setKeyword(e.target.value)}
					placeholder="Tìm kiếm tên phòng"
					className="w-[400px] rounded-lg bg-gray-100 outline-none"
					startContent={<i className="fas fa-search mr-2 text-gray-500"></i>}
				/>
				{auth.roles[0] === ROLES.HOST && (
					<div className="mb-3 flex items-center justify-between">
						<div className="mt-2 flex w-full items-center justify-end">
							<Button
								onClick={createAcmd}
								size="sm"
								color="primary"
							>
								Tạo chỗ nghỉ mới
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="mt-4">
				<CustomTable
					columns={columns}
					data={data ?? []}
					isLoading={loading}
				/>
			</div>
		</div>
	)
}
