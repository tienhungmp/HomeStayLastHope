import {CustomTable} from '@components/custom-table/CustomTable'
import {Chip} from '@nextui-org/react'
import React, {useEffect, useState} from 'react'

import {convertStringToNumber, getDate} from '@utils/Utils'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'

export default function AdminPaymentsPage() {
	const [balance, setBalance] = useState(0)
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const {auth} = useAuth()
	useEffect(() => {
		if (auth) {
			loadList()
		}
	}, [auth])

	function loadList() {
		setLoading(true)
		factories
			.getWalletInfo(auth._id)
			.then(data => {
				setData(data?.payments)
				setBalance(data?.balance)
				setLoading(false)
				// setPagination(data.pagination);
			})
			.finally(() => setLoading(false))
	}

	const columns = [
		{
			id: 'code',
			label: 'Mã giao dịch',
			renderCell: row => <div className="w-20">{row.txnRef}</div>,
		},
		{
			id: 'time',
			label: 'Thời Gian',
			renderCell: row => <div className="flex-grow">{getDate(row.createAt, 5)}</div>,
		},
		{
			id: 'description',
			label: 'Nội dung giao dịch',
			renderCell: row => <div className="flex-grow">{row.description}</div>,
		},
		{
			id: 'amount',
			label: 'Số tiền',
			renderCell: row => (
				<Chip
					color={row.txnRef.includes('I') ? 'success' : 'danger'}
					className="w-44 text-white"
				>
					<span className="">
						{row.txnRef.includes('I') ? '+' : '-'} {convertStringToNumber(row.amount)}
					</span>
				</Chip>
			),
		},
		{
			id: 'Status',
			label: 'Trạng Thái',
			renderCell: row => <Chip color={row.status === 1 ? 'primary' : 'default'}>{row.status ? 'Thành công' : 'Thất bại'}</Chip>,
		},
	]
	return (
		<div className="h-full rounded bg-white px-4 py-3 shadow-md">
			<div className="mb-3 flex items-center justify-between">
				<div className="mt-5 flex w-full justify-end">
					<Chip
						color="primary"
						className="text-lg font-semibold"
					>
						Số dư: {convertStringToNumber(balance)}
					</Chip>
				</div>
			</div>
			<div className="mt-4">
				<CustomTable
					columns={columns}
					data={data ?? []}
					isLoading={loading}
				/>{' '}
			</div>
		</div>
	)
}
