import {Button} from '@chakra-ui/react'
import {cn} from '@utils/Utils'
import React from 'react'
import {useNavigate} from 'react-router-dom'
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
			<div className="mb-2 flex flex-col items-center justify-center">
				<Button
					onClick={handleLogout}
					size="sm"
					className="w-[80%]"
				>
					Đăng xuất
					<i
						className="fa fa-sign-out-alt ml-2 text-red"
						aria-hidden="true"
					></i>
				</Button>
			</div>
		</aside>
	)
}
