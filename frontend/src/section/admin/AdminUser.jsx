import {CustomTable} from '@components/custom-table/CustomTable'
import RegisterModal from '@components/header/Register'
import ConfirmModal from '@components/modal/ConfirmModal'
import EditUserModal from '@components/modal/EditUserModal'
import {Avatar, Button, Chip, Input, Tab, Tabs} from '@nextui-org/react'
import {GENDER, ROLES, STATUS} from '@utils/constants'
import {ToastInfo, ToastNotiError} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'

export default function AdminUser({isAdmin}) {
	const {auth} = useAuth()
	const [activeTab, setActiveTab] = useState(isAdmin ? '' : ROLES.EMPLOYEE)
	const [keyword, setKeyword] = useState()
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const [pagination, setPagination] = useState()

	useEffect(() => {
		loadList()
	}, [keyword, activeTab, pagination?.current])

	function loadList() {
		setLoading(true)
		const params = {
			roles: activeTab,
			limit: 10,
			page: pagination?.current,
			...(auth.roles[0] === ROLES.HOST && {bossId: auth._id}),
			...(keyword ? {keyword} : {}),
		}
		factories
			.getListUser(params)
			.then(data => {
				setData(data?.users)
				setLoading(false)
				setPagination(data.pagination)
			})
			.finally(() => setLoading(false))
	}

	const columns = [
		{
			id: 'name',
			label: 'Họ và tên',
			renderCell: row => <div className="w-40">{row?.fullName}</div>,
		},
		{
			id: 'avatar',
			label: 'Ảnh đại diện',
			renderCell: row => <Avatar src={row?.profilePictureUrl} />,
		},
		{
			id: 'role',
			label: 'Email',
			renderCell: row => <span>{row?.email}</span>,
		},
		{
			id: 'phone',
			label: 'Số điện thoại',
			renderCell: row => <span>{row?.phone}</span>,
		},
		{
			id: 'gender',
			label: 'Giới tính',
			renderCell: row => <span>{GENDER[row?.gender]}</span>,
		},
		{
			id: 'dob',
			label: 'Ngày sinh',
			renderCell: row => <span>{row?.dob}</span>,
		},
		{
			id: 'status',
			label: 'Trạng thái',
			renderCell: row => (
				<Chip
					color={row.status ? 'success' : 'default'}
					className="text-white"
				>
					{STATUS[row?.status]}
				</Chip>
			),
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
						onClick={() => handleEdit(row)}
					>
						<i className="fas fa-pen text-sm text-gray-400"></i>
					</Button>
					<Button
						onClick={() => handleDisable(row)}
						variant="ghost"
						size="sm"
						className="h-8 max-w-8 border-none"
					>
						{row?.status ? <i className="fas fa-pause text-sm text-red"></i> : <i className="fas fa-play text-sm text-blue-500"></i>}
					</Button>
				</div>
			),
		},
	]

	const {onOpen, onClose} = useModalCommon()
	function handleEdit(row) {
		onOpen({
			view: (
				<EditUserModal
					auth={row}
					onReload={loadList}
				/>
			),
			title: 'Chỉnh sửa tài khoản',
			showFooter: false,
			size: '4xl',
		})
	}
	function handleDisable(row) {
		onOpen({
			view: (
				<ConfirmModal
					content="Xác nhận vô hiệu hóa tài khoản này ?"
					onSubmit={() => onDelete(row)}
				/>
			),
			title: 'Xác nhận',
			showFooter: false,
		})
	}
	function onDelete(row) {
		const newValues = {
			...row,
			page: pagination?.current,
			status: !row.status,
		}
		factories
			.updateUserInfo(row._id, newValues)
			.then(() => {
				ToastInfo('Cập nhật thông tin thành công')
				onClose()
				loadList()
			})
			.catch(err => {
				if (err.response?.data?.message) {
					ToastNotiError(err.response?.data?.message)
				}
			})
	}
	function addEmployee() {
		onOpen({
			view: (
				<RegisterModal
					addEmployee
					onReload={loadList}
					bossId={auth._id}
				/>
			),
			title: 'Đăng ký tài khoản mới',
			showFooter: false,
		})
	}
	return (
		<div className="rounded bg-white px-4 py-3">
			<div className="flex flex-row items-center justify-between gap-4">
				<Input
					type="text"
					placeholder="Tìm kiếm tên, số điện thoại"
					className="w-[400px] rounded-lg bg-gray-100 outline-none"
					onChange={e => setKeyword(e.target.value)}
					startContent={<i className="fas fa-search mr-2 text-gray-500"></i>}
				/>
				<div className="mb-3 flex items-center justify-between rounded-xl border">
					<div className="flex">
						{auth?.roles[0] === ROLES.ADMIN && (
							<>
								<Tabs
									variant="light"
									color="primary"
									aria-label="Tabs colors"
									radius="lg"
									selectedKey={activeTab}
									onSelectionChange={setActiveTab}
								>
									<Tab
										key=""
										title="Tất cả"
									/>
									<Tab
										key={ROLES.USER}
										title="Khách hàng"
									/>
									<Tab
										key={ROLES.HOST}
										title="Chủ chỗ nghỉ"
									/>
									<Tab
										key={ROLES.EMPLOYEE}
										title="Nhân viên"
									/>
								</Tabs>
							</>
						)}
					</div>
					{auth.roles?.[0] === ROLES.HOST && (
						<Button
							onClick={addEmployee}
							className="rounded-lg bg-blue-500 px-4 py-2 text-white"
							size="sm"
						>
							+ Thêm nhân viên
						</Button>
					)}
				</div>
			</div>
			<div className="mt-4">
				<CustomTable
					columns={columns}
					data={data}
					isLoading={loading}
					isShowPagination
					// limit={10}
					total={pagination?.total}
					page={pagination?.page}
					setPage={page => setPagination({...pagination, current: page})}
				/>{' '}
			</div>
		</div>
	)
}
