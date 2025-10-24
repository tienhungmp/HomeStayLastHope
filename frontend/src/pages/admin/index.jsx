import HeaderAdmin from '@components/header/HeaderAdmin'
import {RouterPath} from '@router/RouterPath'
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import AdminAccommodationList from '../../section/admin/AdminAccommodationList'
import AdminBookingListSection from '../../section/admin/AdminBookingListSection'
import AdminPaymentsPage from '../../section/admin/AdminPayments'
import AdminRequestHost from '../../section/admin/AdminRequestHost'
import AdminReviewList from '../../section/admin/AdminReviewList'
import AdminRoomList from '../../section/admin/AdminRoomList'
import AdminSideBar from '../../section/admin/AdminSideBar'
import AdminUser from '../../section/admin/AdminUser'
import Dashboard from '../../section/admin/Dashboard'
import {ROLES, sidebarItems} from '../../utils/constants'

export default function AdminPage() {
	const [selectedItem, setSelectedItem] = useState('dashboardAll')
	const [selectedName, setSelectedName] = useState('Tổng quan')
	const [filterItems, setFilterItems] = useState([])
	const {auth, loading} = useAuth()
	const {onOpen} = useModalCommon()
	const navigator = useNavigate()

	const handleItemClick = (itemId, name) => {
		setSelectedItem(itemId)
		setSelectedName(name)
	}

	useEffect(() => {
		if (auth) {
			if (auth.roles[0] === ROLES.USER) {
				navigator(RouterPath.NOT_FOUND)
				return
			}
			const newList = sidebarItems.filter(item => item.roles.includes(auth.roles[0]))
			setFilterItems(newList)
		}
	}, [auth])

	useEffect(() => {
		if (filterItems?.length > 0) {
			setSelectedItem(filterItems[0].id)
			setSelectedName(filterItems[0].title)
		}
	}, [filterItems])

	const renderContent = () => {
		switch (selectedItem) {
			case 'dashboard':
				return <Dashboard />
			case 'users':
				return <AdminUser />
			case 'accommodation':
				return <AdminAccommodationList />
			case 'room':
				return <AdminRoomList />
			case 'request':
				return <AdminRequestHost />
			case 'booking':
				return <AdminBookingListSection />
			case 'review':
				return <AdminReviewList />
			case 'payments':
				return <AdminPaymentsPage />
			default:
				return 'Not Found'
		}
	}

	if (!loading)
		return (
			<div className="flex flex-row">
				<div className="flex w-full">
					<AdminSideBar
						selectedItem={selectedItem}
						onSelectItem={(id, label) => {
							return handleItemClick(id, label)
						}}
						filteredItems={filterItems}
					/>
					<main className="h-screen flex-1 items-start overflow-scroll">
						<HeaderAdmin title={selectedName} />
						{renderContent()}
					</main>
				</div>
			</div>
		)
}
