import {Button, Card, CardBody, CardHeader, Divider, Spinner} from '@nextui-org/react'
import {convertStringToNumber, ToastNotiError} from '@utils/Utils'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'

export default function PaymentSuccessPage() {
	const navigator = useNavigate()
	const urlParams = new URLSearchParams(window.location.search)
	const params = Object.fromEntries(urlParams)
	const {auth} = useAuth()
	const vnp_Amount = params.vnp_Amount / 100
	const vnp_BankCode = params.vnp_BankCode
	const vnp_BankTranNo = params.vnp_BankTranNo
	const vnp_ResponseCode = params.vnp_ResponseCode
	//   const vnp_OrderInfo = params.vnp_OrderInfo;
	//   const vnp_TransactionNo = params.vnp_TransactionNo;
	const vnp_TxnRef = params.vnp_TxnRef
	const [status, setStatus] = useState()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (auth && vnp_TxnRef) {
			if (vnp_ResponseCode !== '00') {
				ToastNotiError('Giao dịch thất bại')
				setStatus(false)
				setLoading(false)
				return
			}
			const data = {userId: auth._id, txnRef: vnp_TxnRef}
			factories
				.updatePayment(data)
				.then(resp => {
					if (resp.status === 200) {
						setStatus(true)
						setLoading(false)
					} else {
						setStatus(false)
					}
				})
				.catch(error => {
					ToastNotiError(error?.response?.data?.message)
					setLoading(false)
					setStatus(false)
				})
		}
	}, [vnp_TxnRef, auth])
	return (
		<div className="mx-auto mb-20 mt-32 flex max-w-full justify-center gap-4 px-5">
			<Card css={{mw: '400px', p: '$10'}}>
				<CardHeader className="flex gap-3">
					{loading ? (
						<div className="flex w-full items-center justify-center">
							<Spinner />
						</div>
					) : (
						<>
							{status ? (
								<div className="flex w-full flex-col items-center justify-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 p-4">
										<i className="fa fa-check text-xl text-green-600"></i>
									</div>
									<p className="text-center font-bold">Thanh toán giao dịch thành công</p>
								</div>
							) : (
								<div className="flex w-full flex-col items-center justify-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red p-4">
										<i className="fa fa-check text-xl text-white"></i>
									</div>
									<p className="text-center font-bold">Thanh toán giao dịch thất bại</p>
								</div>
							)}
						</>
					)}
				</CardHeader>
				<Divider />
				<CardBody className="min-w-[330px] gap-5 px-4">
					<div className="flex items-center justify-between">
						<p className="font-bold">Ngân hàng:</p>
						<p>{vnp_BankCode}</p>
					</div>
					<div className="flex items-center justify-between">
						<p className="font-bold">Mã chuyển khoản:</p>
						<p>{vnp_BankTranNo}</p>
					</div>
					<div className="flex items-center justify-between">
						<p className="font-bold">Mã giao dịch:</p>
						<p>{vnp_TxnRef}</p>
					</div>
					<div className="flex items-center justify-between">
						<p className="font-bold">Số tiền:</p>
						<p>{convertStringToNumber(vnp_Amount)}</p>
					</div>
					<Button
						className="mt-5"
						auto
						color="primary"
						onPress={() => navigator('/')}
					>
						Trang chủ
					</Button>
				</CardBody>
			</Card>
		</div>
	)
}
