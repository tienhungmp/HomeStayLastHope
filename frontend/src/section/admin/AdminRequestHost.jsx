import {CustomTable} from '@components/custom-table/CustomTable'
import {Button, Input} from '@nextui-org/react'
import {getDate, ToastInfo, ToastNotiError} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {factories} from '../../factory'

export default function AdminRequestHost() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const [pagination, setPagination] = useState([])

	useEffect(() => {
		setLoading(true)
		loadList()
	}, [])

	function loadList() {
		factories
			.getRequestHost()
			.then(data => {
				setData(data.requests)
				setPagination(data.pagination)
			})
			.finally(() => setLoading(false))
	}


	const columns = [
		{
			id: 'PassengerName',
			label: 'Họ và Tên',
			renderCell: row => <div className="w-40">{row.targetId?.fullName}</div>,
		},
		{
			id: 'Email',
			label: 'Email',
			renderCell: row => <div className="w-40">{row.targetId?.email}</div>,
		},
		{
			id: 'time',
			label: 'Thời Gian',
			renderCell: row => <span>{getDate(row.targetId?.createdAt, 2)}</span>,
		},
		{
			id: 'Status',
			label: 'Chấp nhận',
			renderCell: row => (
				<Button
					size="sm"
					color="primary"
					onClick={() => handleChangeStatus(row._id, 1)}
				>
					Duyệt
				</Button>
			),
		},
		{
			id: 'Status',
			label: 'Từ chối',
			renderCell: row => (
				<Button
					size="sm"
					color={'danger'}
					onClick={() => handleChangeStatus(row._id, 2)}
				>
					Từ chối
				</Button>
			),
		},
	]

	function handleChangeStatus(id, status) {
		factories
			.updateStatusRequest(id, status)
			.then(e => {
				ToastInfo(e.message)
				loadList()
			})
			.catch(error => {
				const dataE = error.response.data.message
				loadList()
				ToastNotiError(dataE)
			})
	}

	return (
		<div
			className="rounded bg-white px-4 py-3 pt-6 shadow-md"
			style={{
				height: 'calc(100% - 100px)',
			}}
		>
			<Input
				type="text"
				placeholder="Tìm kiếm tên, số điện thoại"
				className="w-full rounded-lg bg-gray-100 outline-none"
				startContent={<i className="fas fa-search mr-2 text-gray-500"></i>}
			/>
			<div className="mt-4">
				<CustomTable
					columns={columns}
					data={data}
					isLoading={loading}
				/>
			</div>
		</div>
	)
}
