import {Button} from '@chakra-ui/react'
import {cn} from '@utils/Utils'
import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'

export default function AdminSideBar({selectedItem, onSelectItem, filteredItems = []}) {
	const {logout} = useAuth()
	const navigator = useNavigate()
	function handleLogout() {
		logout()
		navigator('/')
	}

	return (
		<aside className="flex h-screen w-[170px] flex-col justify-between bg-white shadow-xl">
			<div className="flex flex-col items-center py-0">
				{filteredItems.map(item => {
					return (
						<button
							variant={'ghost'}
							key={item.id}
							onClick={() => onSelectItem(item.id, item.title)}
							start
							className={cn(
								'p-none flex w-full items-center justify-start gap-2 border-none p-2',
								selectedItem === item.id && 'bg-blue-100',
							)}
						>
							<i
								key={item.id}
								className={`fas ${item.icon} w-8 cursor-pointer ${selectedItem === item.id ? 'text-blue-500' : 'text-gray-500'}`}
							></i>
							<p className={cn('font-semibold', selectedItem === item.id && 'font-bold text-blue-700')}>{item.label}</p>
						</button>
					)
				})}
			</div>

			<div className="mb-4 flex flex-col items-center gap-3 px-4">
				<Link
					to="/"
					className="flex w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800"
				>
					<i className="fa fa-home mr-2" aria-hidden="true"></i>
					Home
				</Link>
				<button
					onClick={handleLogout}
					className="flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:text-red-800"
				>
					<i className="fa fa-sign-out-alt mr-2" aria-hidden="true"></i>
					Đăng xuất
				</button>
			</div>
		</aside>
	)
}
