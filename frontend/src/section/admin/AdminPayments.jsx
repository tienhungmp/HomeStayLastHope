import {CustomTable} from '@components/custom-table/CustomTable'
import {Chip, Input} from '@nextui-org/react'
import React, {useEffect, useState} from 'react'

import {convertStringToNumber, getDate} from '@utils/Utils'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'

// Utility to remove Vietnamese accents
const removeVietnameseAccents = str =>
	str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')

export default function AdminPaymentsPage() {
	const [balance, setBalance] = useState(0)
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const [search, setSearch] = useState('')
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
			})
			.finally(() => setLoading(false))
	}

	const filteredData = React.useMemo(() => {
		if (!search.trim()) return data
		const lowerSearch = removeVietnameseAccents(search.toLowerCase())
		return data.filter(row => {
			const txnRef = removeVietnameseAccents(row.txnRef?.toLowerCase() || '')
			const description = removeVietnameseAccents(row.description?.toLowerCase() || '')
			const dateStr = removeVietnameseAccents(getDate(row.createAt, 5).toLowerCase())
			return (
				txnRef.includes(lowerSearch) ||
				description.includes(lowerSearch) ||
				dateStr.includes(lowerSearch)
			)
		})
	}, [data, search])

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
			id: 'description',
			label: 'Người dùng',
			renderCell: row => <div className="flex-grow">{row.userId.fullName}</div>,
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
				<Input
					placeholder="Tìm kiếm theo mã giao dịch, nội dung, thời gian..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="max-w-md"
				/>
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
					data={filteredData ?? []}
					isLoading={loading}
				/>
			</div>
		</div>
	)
}
