import {Button, Input} from '@nextui-org/react'
import {ROLES} from '@utils/constants'
import {EmailAuthProvider, linkWithCredential} from 'firebase/auth'
import React, {useState} from 'react'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'
import {ToastInfo, ToastNotiError} from '../../utils/Utils'
import LoginModal from './Login'

const RegisterModal = ({addEmployee, bossId, onReload}) => {
	const {onOpen, onClose} = useModalCommon()

	const [isVisible, setIsVisible] = useState(false)
	const [isVisible2, setIsVisible2] = useState(false)
	const [loading, setLoading] = useState(false)
	const toggleVisibility = () => setIsVisible(!isVisible)
	const toggleVisibility2 = () => setIsVisible2(!isVisible2)

	const openLogin = () => {
		onOpen({
			view: <LoginModal />,
			title: 'Đăng nhập',
			showFooter: false,
		})
	}

	const handleSignUpEmail = () => {
		setLoading(true)
		const email = document.getElementById('email').value
		const password = document.getElementById('password').value
		const confirmPassword = document.getElementById('confirmPassword').value
		const validateEmail = email => {
			const re =
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			return re.test(String(email).toLowerCase())
		}
		if (!validateEmail(email) || !email.endsWith('@gmail.com')) {
			ToastNotiError('Vui lòng nhập email đúng định dạng')
			setLoading(false)
			return
		}
		if (!password || !confirmPassword || !email) {
			ToastNotiError('Vui lòng nhập thông tin')
			setLoading(false)
			return
		}
		if (password.length < 8 || confirmPassword.length < 8) {
			ToastNotiError('Mật khẩu tối thiểu 8 ký tự')
		}
		if (password !== confirmPassword) {
			ToastNotiError('Mật khẩu không khớp, vui lòng nhập lại mật khẩu')
			setLoading(false)
			return
		}
		const metaData = {
			email,
			password: password,
			fullName: email.replace('@gmail.com', ''),
			profilePictureUrl: 'https://ui-avatars.com/api/?name=' + email.replace('@gmail.com', ''),
			roles: [addEmployee ? ROLES.EMPLOYEE : ROLES.USER],
			bossId: bossId ?? '',
		}
		factories
			.getSignUpEmail(metaData)
			.then(data => {
				ToastInfo('Đăng ký tài khoản thành công')
				setLoading(false)
				if (addEmployee) {
					onClose()
					onReload()
					return
				}
				openLogin()
			})
			.catch(error => {
				setLoading(false)
				const dataE = error.response.data.message
				ToastNotiError(dataE)
			})
	}

	async function linkEmailAndPassword(user, email, password) {
		try {
			const credential = EmailAuthProvider.credential(email, password)
			const linkedUser = await linkWithCredential(user, credential)
			return linkedUser
		} catch (error) {
			if (error.code === 'auth/email-already-in-use') {
				console.error('Email đã liên kết với tài khoản khác.')
			} else {
				console.error('Lỗi liên kết Email & Password:', error.message)
			}
			throw error
		}
	}

	//   const handleGoogleSignUp = async () => {
	//     try {
	//       const result = await signInWithPopup(auth, googleProvider);
	//       const user = result.user;
	//       await linkEmailAndPassword(user, email, user.uid);
	//       ToastInfo('Đăng ký thành công.');
	//     } catch (error) {
	//       if (
	//         error?.response?.data.error ===
	//         'Firebase: Error (auth/email-already-in-use).'
	//       ) {
	//         ToastNotiError('Email đã được sử dụng');
	//         return;
	//       }
	//       ToastNotiError('Đăng ký thất bại, vui lòng thử lại.');
	//     }
	//   };

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
				<Input
					id="confirmPassword"
					label="Nhập lại mật khẩu"
					placeholder="Nhập lại mật khẩu"
					className="mt-5"
					endContent={
						<button
							className="focus:outline-none"
							type="button"
							aria-label="toggle password visibility"
							onClick={toggleVisibility2}
						>
							{isVisible2 ? (
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
					type={isVisible2 ? 'text' : 'password'}
				/>
			</div>

			<Button
				onClick={handleSignUpEmail}
				className="mt-8 w-full rounded-lg"
				variant="solid"
				color="primary"
				isLoading={loading}
			>
				Đăng ký
			</Button>

			{/* <div className="mt-4 flex w-full items-center">
				<div className="h-[1px] flex-grow bg-neutral-200" />
				<p className="px-2">hoặc</p>
				<div className="h-[1px] flex-grow bg-neutral-200" />
			</div> */}

			<div className="mt-4">
				{/* <Button
            radius={'sm'}
            color="primary"
            className="w-full"
            onClick={handleGoogleSignUp}
        >
            Đăng ký với Google
        </Button> */}
				{!addEmployee && (
					<div className="mt-4 flex pb-4">
						<p>Bạn đã có tài khoản?</p>
						<button
							onClick={() => openLogin()}
							className="px-2 font-bold text-cyan-dark"
						>
							Đăng nhập
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default RegisterModal
