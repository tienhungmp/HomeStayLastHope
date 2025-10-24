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
			id: 'rating',
			label: 'Đánh giá',
			renderCell: row => <div className="w-40">{row?.rating || 'Chưa có đánh giá'}</div>,
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
				<div className="w-48">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-2 max-w-2 border-none"
						onClick={() => editAcmd(row)}
					>
						<i className="fas fa-pen text-sm text-gray-400"></i>
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
