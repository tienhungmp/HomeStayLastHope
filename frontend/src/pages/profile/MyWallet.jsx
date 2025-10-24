import {CustomTable} from '@components/custom-table/CustomTable'
import Sidebar from '@components/sidebar/SideBar'
import {Button, Chip} from '@nextui-org/react'
import {convertStringToNumber, getDate} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'
import AddWalletModal from './AddWalletModal'

const columns = [
	{
		id: 'code',
		label: 'Mã giao dịch',
		renderCell: row => <div className="w-20">{row.txnRef}</div>,
	},
	{
		id: 'time',
		label: 'Thời Gian',
		renderCell: row => <div className="flex-grow">{getDate(row.createAt, 2)}</div>,
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
				<span className="">{row.txnRef.includes('I') && '+' + convertStringToNumber(row.amount)}</span>
				<span className="">{row.txnRef.includes('O') && '-' + convertStringToNumber(row.amount)}</span>
				<span className="">{!row.txnRef.includes('O') && !row.txnRef.includes('I') && convertStringToNumber(row.amount)}</span>
			</Chip>
		),
	},
	{
		id: 'Status',
		label: 'Trạng Thái',
		renderCell: row => <Chip color={row.status === 1 ? 'primary' : 'default'}>{row.status ? 'Thành công' : 'Thất bại'}</Chip>,
	},
]

export default function MyWalletPage() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const [balance, setBalance] = useState(0)
	const [pagination, setPagination] = useState()
	const {auth} = useAuth()
	const {onOpen} = useModalCommon()
	function loadList() {
		setLoading(true)
		factories
			.getWalletInfo(auth._id)
			.then(data => {
				setData(data?.payments)
				setBalance(data?.balance)
				setLoading(false)
				setPagination(data.pagination)
			})
			.finally(() => setLoading(false))
	}
	function handleAddWallet() {
		onOpen({
			title: 'Nộp tiền',
			view: <AddWalletModal />,
		})
	}
	useEffect(() => {
		if (!auth?._id) return
		loadList()
	}, [auth])
	return (
		<div className="mx-auto my-20 flex justify-center">
			<div className="flex w-full max-w-[80%] gap-4 rounded-lg border bg-white p-4 shadow-lg">
				<div className="w-fit">
					<Sidebar active="1" />
				</div>
				<div className="flex w-full">
					<div className="w-full">
						<div className="flex flex-row justify-between p-2">
							<div className="flex w-full flex-col items-end justify-end gap-2">
								<div className="flex gap-2">
									<h5 className="text-2xl font-bold">Số dư:</h5>
									<span className="text-2xl font-bold">{convertStringToNumber(balance)}</span>
								</div>
								<Button
									color="primary"
									onClick={handleAddWallet}
									endContent={<i className="fas fa-plus"></i>}
								>
									Nộp tiền
								</Button>
							</div>
						</div>
						<div>
							<CustomTable
								columns={columns}
								data={data ?? []}
								isLoading={loading}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
