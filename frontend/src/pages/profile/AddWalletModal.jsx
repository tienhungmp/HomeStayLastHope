import { Button, Input } from '@nextui-org/react'
import { ToastNotiError } from '@utils/Utils'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { factories } from '../../factory'

export default function AddWalletModal() {
	const [money, setMoney] = useState('')
	const { auth } = useAuth()
	const handleAdd = () => {
		if (money < 20000) return ToastNotiError('Vui lý nhập số tiền >= 20.000đ')
		if (money > 100000000) return ToastNotiError('Vui lý nhập số tiền < 100.000.000đ')
		if (money === '') return ToastNotiError('Vui lý nhập số tiền')
		factories
			.createPayment({ userId: auth._id, amount: parseInt(money) })
			.then(data => {
				window.location.href = data.url
			})
			.catch(error => {
				ToastNotiError('Có lỗi xảy ra khi nạp tiền')
			})
		onClose()
	}

	return (
		<div className="pb-4">
			<Input
				label="Số tiền"
				type="number"
				value={money}
				onChange={e => setMoney(e.target.value)}
				placeholder="0.00"
				style={{
					textAlign: 'right',
				}}
				endContent={
					<div className="pointer-events-none flex items-center">
						<span className="text-small text-default-400">VNĐ</span>
					</div>
				}
			/>
			<Button
				onPress={handleAdd}
				className="mt-4 w-full"
				size="md"
				color="primary"
			>
				Nạp tiền vào ví cá nhân
			</Button>
		</div>
	)
}
