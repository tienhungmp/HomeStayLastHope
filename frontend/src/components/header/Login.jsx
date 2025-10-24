import {Button, Input} from '@nextui-org/react'
import React, {useState} from 'react'
import {useAuth} from '../../context/AuthContext'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'
import {RouterPath} from '../../router/RouterPath'
import {ROLES} from '../../utils/constants'
import {ToastNotiError} from '../../utils/Utils'
import RegisterModal from './Register'

const LoginModal = () => {
	const {onOpen, onClose} = useModalCommon()
	const [isVisible, setIsVisible] = useState(false)
	const [loading, setIsLoading] = useState(false)

	const toggleVisibility = () => setIsVisible(!isVisible)

	const {login} = useAuth()
	function openRegister() {
		onOpen({
			view: <RegisterModal />,
			title: 'Đăng ký',
			showFooter: false,
		})
	}

	// const handleGoogleLogin = async () => {
	// 	try {
	// 		setIsLoading(true)
	// 		const result = await signInWithPopup(auth, googleProvider)
	// 		const user = result.user
	// 		if (user) {
	// 			handleLoginEmail(user.email, user.uid)
	// 			setIsLoading(false)
	// 			return
	// 		}
	// 		setIsLoading(false)
	// 		ToastNotiError('Đăng nhập thất bại, vui lòng thử lại.')
	// 	} catch (error) {
	// 		setIsLoading(false)
	// 		ToastNotiError('Đăng nhập thất bại, vui lòng thử lại.')
	// 	}
	// }

	function getUserInfo(data) {
		login(data)
		onClose()
		if (data.roles[0] === ROLES.ADMIN) {
			window.location.href = RouterPath.ADMIN
		}
	}

	const handleLoginEmail = (email, password) => {
		const validateEmail = email => {
			const re =
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			return re.test(String(email).toLowerCase())
		}
		if (email !== 'admin@booking.com') {
			if (!validateEmail(email) || !email.endsWith('@gmail.com')) {
				ToastNotiError('Vui lòng nhập email đúng định dạng')
				setIsLoading(false)
				return
			}
		}

		setIsLoading(true)
		factories
			.getLoginEmail(email, password)
			.then(data => {
				getUserInfo(data.user)
				setIsLoading(false)
			})
			.catch(error => {
				ToastNotiError(error?.response.data.message)
				setIsLoading(false)
			})
	}

	return (
		<div>
			<div className="w-full">
				<Input
					type="email"
					label="Email"
					id="email"
				/>
				<Input
					id="password"
					label="Mật khẩu"
					placeholder="Nhập mật khẩu"
					className="mt-5"
					onKeyDown={e => {
						if (e.key === 'Enter') {
							handleLoginEmail(document.getElementById('email').value, document.getElementById('password').value)
						}
					}}
					endContent={
						<button
							className="focus:outline-none"
							type="button"
							aria-label="toggle password visibility"
							onClick={toggleVisibility}
						>
							{isVisible ? (
								<i
									className="fa fa-eye-slash"
									aria-hidden="true"
								></i>
							) : (
								<i
									className="fa fa-eye"
									aria-hidden="true"
								></i>
							)}
						</button>
					}
					type={isVisible ? 'text' : 'password'}
				/>
			</div>

			<Button
				className="mt-8 w-full rounded-lg"
				isLoading={loading}
				color="primary"
				onClick={() => handleLoginEmail(document.getElementById('email').value, document.getElementById('password').value)}
			>
				Đăng nhập
			</Button>

			<div className="mt-4 flex w-full items-center">
				<div className="h-[1px] flex-grow bg-neutral-200" />
				<p className="px-2">hoặc</p>
				<div className="h-[1px] flex-grow bg-neutral-200" />
			</div>

			<div className="mt-4">
				{/* <Button
					radius={'sm'}
					color="primary"
					className="w-full"
					onClick={handleGoogleLogin}
				>
					Đăng nhập với Google
				</Button> */}
				<div className="mt-4 flex">
					<p>Bạn chưa có tài khoản?</p>
					<button
						onClick={() => openRegister()}
						className="px-2 font-bold text-cyan-dark"
					>
						Đăng ký
					</button>
				</div>
			</div>
		</div>
	)
}

export default LoginModal
