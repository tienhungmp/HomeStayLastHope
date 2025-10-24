import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react'
import React, { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import InputField from '../../components/common/InputField'
import { useAuth } from '../../context/AuthContext'
import { useModalCommon } from '../../context/ModalContext'
import { factories } from '../../factory'
import useRouter from '../../hook/use-router'
import { ToastNotiError } from '../../utils/Utils'
import { ROLES } from '../../utils/constants'

export default function RegisterHost() {
	const formRef = useRef()
	const methods = useForm()
	const { auth } = useAuth()
	const { onOpen } = useModalCommon()
	const [loading, setLoading] = useState(false)
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const router = useRouter()

	const {
		register,
		setValue,
		formState: { errors },
	} = methods

	useEffect(() => {
		if (auth) {
			setValue('email', auth.email)
			setValue('displayName', auth.displayName)
			setValue('phone', auth.phone)
		}
	}, [auth])

	const handleSignUpEmail = (values) => {
		setLoading(true)
		const re =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (!re.test(String(values.email).toLowerCase())) {
			ToastNotiError('Email không hợp lệ')
			setLoading(false)
			return
		}
		if (!values.email) {
			ToastNotiError('Vui lòng nhập email')
			return
		}
		if (!values.phone) {
			ToastNotiError('Vui lòng nhập số điện thoại')
			return
		}
		if (!values.fullName) {
			ToastNotiError('Vui lòng nhập họ và tên')
			return
		}
		const metaData = {
			email: values.email,
			password: '12345678',
			fullName: values.fullName,
			phone: values.phone,
			branchName: values.name,
			profilePictureUrl: 'https://ui-avatars.com/api/?name=' + values.fullName,
			roles: [ROLES.HOST],
		}
		factories
			.getSignUpEmail(metaData)
			.then((data) => {
				setLoading(false)
				setShowSuccessModal(true)
			})
			.catch((error) => {
				setLoading(false)
				const dataE = error?.response?.data?.message || 'Đăng ký thất bại'
				ToastNotiError(dataE)
			})
	}

	return (
		<div>
			{/* ---------- HEADER ---------- */}
			<header className="bg-blue-800 p-8 text-white">
				<div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
					<div className="text-center md:text-left">
						<h1 className="text-4xl font-bold">
							Đăng căn hộ của Quý vị trên <span className="text-white">Booking.com</span>
						</h1>
						<p className="mt-4">
							Dù host là nghề tay trái hay công việc toàn thời gian, hãy đăng nhà của bạn ngay hôm nay và nhanh chóng có thêm nguồn thu
							nhập.
						</p>
					</div>
					<div className="mt-8 rounded-lg bg-white p-6 text-black shadow-lg md:mt-0">
						<h2 className="mb-4 text-xl font-bold">Đăng ký trở thành đối tác</h2>
						<ul className="list-inside list-disc">
							<li>45% host nhận được đơn đặt đầu tiên trong vòng 1 tuần</li>
							<li>Chọn một trong hai cách nhận đơn đặt: xác nhận tức thì và xem trước để duyệt</li>
							<li>Chúng tôi xử lý thanh toán thay Quý vị</li>
						</ul>
						<button
							className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
							onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
						>
							Bắt đầu ngay
						</button>
					</div>
				</div>
			</header>

			{/* ---------- FORM ---------- */}
			<div ref={formRef} className="mt-10 flex w-full items-center justify-center pb-32">
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(handleSignUpEmail)}>
						<div className="flex max-w-2xl flex-col gap-4 rounded-lg bg-white px-6 py-8 shadow-lg">
							<p className="mt-0 w-full text-center text-2xl font-bold">Trở thành đối tác của chúng tôi</p>
							<InputField
								label="Họ và tên"
								placeholder="Nhập họ và tên"
								name={'fullName'}
								register={register}
								isRequired
								validate={{ required: 'Bắt buộc nhập' }}
								errors={errors}
							/>
							<InputField
								placeholder="Nhập số điện thoại"
								label="Số điện thoại"
								name={'phone'}
								validate={{ required: 'Bắt buộc nhập' }}
								isRequired
								type="number"
								register={register}
								errors={errors}
							/>
							<InputField
								placeholder="Nhập email liên hệ"
								label="Email"
								validate={{ required: 'Bắt buộc nhập' }}
								isRequired
								name={'email'}
								register={register}
								errors={errors}
							/>
							<Button className="mt-2" color="primary" type="submit" isLoading={loading}>
								Gửi yêu cầu
							</Button>
						</div>
					</form>
				</FormProvider>
			</div>

			{/* ---------- MODAL ---------- */}
			<Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} size="md" backdrop="blur" isDismissable={false}>
				<ModalContent>
					<ModalHeader className="text-2xl font-bold text-blue-700">Đăng ký thành công 🎉</ModalHeader>
					<ModalBody>
						<p className="text-gray-700">
							Cảm ơn bạn đã đăng ký trở thành đối tác của chúng tôi!  
							Vui lòng chờ trong giây lát để quản trị viên duyệt yêu cầu của bạn.
						</p>
						<p className="mt-2 font-semibold text-blue-600">
							Mật khẩu mặc định của bạn là: <span className="font-bold">12345678</span>
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							onPress={() => {
								setShowSuccessModal(false)
								router.push({ pathname: '/' })
							}}
						>
							Về trang chủ
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	)
}
