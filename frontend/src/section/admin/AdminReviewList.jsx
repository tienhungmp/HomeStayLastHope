import {CustomTable} from '@components/custom-table/CustomTable'
import {Avatar, Button, Tab, Tabs} from '@nextui-org/react'
import React, {useEffect, useState} from 'react'

import {ToastInfo, ToastNotiError} from '@utils/Utils'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'

export default function AdminReviewList() {
	const [activeTab, setActiveTab] = useState(true)
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState([])
	const {onOpen} = useModalCommon()
	const {auth} = useAuth()
	useEffect(() => {
		if (auth) {
			loadList()
		}
	}, [auth, activeTab])
	function loadList() {
		setLoading(true)
		const params = activeTab === '2' ? {isShow: 1} : {}
		factories
			.getReviews(params)
			.then(data => {
				setData(data)
				setLoading(false)
			})
			.finally(() => setLoading(false))
	}
	const columns = [
		{
			id: 'date',
			label: 'Ngày nhận phòng',
			renderCell: row => <div className="flex-grow">{row?.userId?.fullName}</div>,
		},
		{
			id: 'avt',
			label: 'Hinh đại diện',
			renderCell: row => (
				<div className="flex-grow">
					<Avatar src={row?.userId?.profilePictureUrl} />
				</div>
			),
		},
		{
			id: 'star',
			label: 'Số sao',
			renderCell: row => (
				<div className="flex-grow">
					{Array.from({length: row.star}, (_, index) => {
						const starValue = index + 1
						return (
							<i
								key={index}
								className={`fa fa-star cursor-pointer text-lg text-yellow-400 transition-colors`}
							></i>
						)
					})}
				</div>
			),
		},
		{
			id: 'review',
			label: 'Đánh giá',
			renderCell: row => (
				<div className="">
					<span className="">{row?.review}</span>
				</div>
			),
		},
		{
			id: 'pin',
			label: 'Ghim',
			renderCell: row => (
				<Button
					size="sm"
					color={row.isShow ? 'secondary' : 'primary'}
					onClick={() => handleChangeStatus(row._id, row.isShow ? false : true)}
				>
					{row.isShow ? 'Bỏ ghim' : 'Ghim'}
				</Button>
			),
		},
	]
	function handleChangeStatus(id, status) {
		factories
			.updatePinReview(id, status)
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
		<div className="h-full rounded bg-white px-4 py-3 shadow-md">
			<div className="mb-3 flex items-center justify-between">
				<div className="flex">
					<Tabs
						variant="light"
						color="primary"
						aria-label="Tabs colors"
						radius="lg"
						selectedKey={activeTab}
						onSelectionChange={setActiveTab}
					>
						<Tab
							key="1"
							title="Tất cả"
						/>
						<Tab
							key="2"
							title="Đã ghim"
						/>
					</Tabs>
				</div>
			</div>
			<div className="mt-4">
				<CustomTable
					columns={columns}
					data={data ?? []}
					isLoading={loading}
					isShowPagination={false}
				/>
			</div>
		</div>
	)
}
