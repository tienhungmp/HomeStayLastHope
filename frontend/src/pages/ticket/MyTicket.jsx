import {Button} from '@chakra-ui/react'
import {CustomTable} from '@components/custom-table/CustomTable'
import ConfirmModal from '@components/modal/ConfirmModal'
import Sidebar from '@components/sidebar/SideBar'
import {Chip} from '@nextui-org/react'
import {TICKET_STATUS} from '@utils/constants'
import {convertStringToNumber, getDate} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'
import TicketModal from './TicketModal'

export default function MyTicketPage() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const {auth} = useAuth()
	const {onOpen} = useModalCommon()
	function loadList() {
		setLoading(true)
		factories
			.getListTicket({
				userId: auth._id,
			})
			.then(data => {
				setData(data)
				setLoading(false)
			})
			.finally(() => setLoading(false))
	}
	useEffect(() => {
		if (!auth?._id) return
		loadList()
	}, [auth])

	const columns = [
		{
			id: 'date',
			label: 'Ngày nhận phòng',
			renderCell: row => <div className="flex-grow">{getDate(row.fromDate)}</div>,
		},
		{
			id: 'time',
			label: 'Ngày trả phòng',
			renderCell: row => <div className="flex-grow">{getDate(row.toDate)}</div>,
		},
		{
			id: 'Chỗ nghỉ',
			label: 'Chỗ nghỉ',
			renderCell: row => <div className="flex-grow">{row?.accommodation?.name}</div>,
		},
		{
			id: 'amount',
			label: 'Số tiền',
			renderCell: row => (
				<div className="">
					<span className="">{convertStringToNumber(row?.totalPrice)}</span>
				</div>
			),
		},
		{
			id: 'Status',
			label: 'Trạng Thái',
			renderCell: row => (
				<Chip
					color={TICKET_STATUS.find(x => x.value === row.status)?.color}
					className="text-white"
				>
					{TICKET_STATUS.find(x => x.value === row.status)?.label}
				</Chip>
			),
		},
		{
			id: 'Status2',
			label: 'Trạng Thái',
			renderCell: row => (
				<div className="flex gap-2">
					<Button
						size="sm"
						bgColor={'steelblue'}
						borderRadius={'full'}
						onClick={() => openDetail(row)}
						color={'white'}
					>
						Xem thông tin
					</Button>
					{row.status === 1 && (
						<Button
							onClick={() => openConfirm(row)}
							size="sm"
							borderRadius={'full'}
							bgColor={'tomato'}
							color={'white'}
						>
							Huỷ phòng
						</Button>
					)}
				</div>
			),
		},
	]
	function openDetail(row) {
		onOpen({
			view: (
				<TicketModal
					id={row._id}
					onReload={loadList}
				/>
			),
			title: row.accommodation.name,
			size: 'xl',
		})
	}
	function openConfirm(row) {
		onOpen({
			view: (
				<ConfirmModal
					content="Xác nhận huỷ phòng đã đặt?"
					onSubmit={() => onCancelTicket(row._id)}
				/>
			),
			title: 'Xác nhận huỷ đặt phòng',
			size: 'xl',
		})
	}

	function onCancelTicket(id) {
		factories
			.changeStatusTicket(id)
			.then(() => {
				ToastInfo('Huỷ đặt phòng thành công')
			})
			.catch(e => {
				ToastNotiError(e.response.data.message)
			})
			.finally(() => {
				loadList()
			})
	}

	return (
		<div className="mx-auto my-20 flex justify-center">
			<div className="flex w-full max-w-[80%] gap-4 rounded-lg border bg-white p-4 shadow-lg">
				<Sidebar active="1" />
				<div className="flex w-full">
					<div className="w-full gap-4">
						<CustomTable
							columns={columns}
							data={data ?? []}
							isLoading={loading}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
