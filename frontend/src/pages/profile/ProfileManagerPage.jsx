import {parseDate} from '@internationalized/date'
import {Avatar, Button, ButtonGroup, Divider} from '@nextui-org/react'
import React, {useEffect, useState} from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import DatePickerField from '../../components/common/DatePickerField'
import InputField from '../../components/common/InputField'
import Sidebar from '../../components/sidebar/SideBar'
import {useAuth} from '../../context/AuthContext'
import {factories} from '../../factory'
import {getDate, ToastInfo, ToastNotiError, uploadFirebase} from '../../utils/Utils'

export default function ProfileManagerPage() {
	const {auth, login} = useAuth()
	const methods = useForm()
	const [loading, setLoading] = useState(false)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: {errors},
	} = methods
	useEffect(() => {
		if (auth) {
			setValue('fullName', auth.fullName || '')
			setValue('profilePictureUrl', auth.profilePictureUrl || '')
			setValue('phone', auth.phone || '')
			setValue('dob', auth.dob ? parseDate(auth.dob) : null)
			setValue('gender', auth.gender || '')
			setValue('email', auth.email || '')
		}
	}, [auth])
	async function handleSave(values) {
		setLoading(true)
		let newUrl = auth.profilePictureUrl
		if (values.photoFile) {
			newUrl = await uploadFirebase(values.photoFile)
		}
		const newValues = {
			...values,
			profilePictureUrl: newUrl,
			dob: getDate(values.dob, 9) ?? null,
		}
		factories
			.updateUserInfo(auth._id, newValues)
			.then(() => {
				ToastInfo('Cập nhật thông tin thành công')
				handleUserInfo()
				setLoading(false)
			})
			.catch(err => {
				if (err.response?.data?.message) {
					ToastNotiError(err.response?.data?.message)
				}
				setLoading(false)
			})
	}

	function handleUserInfo() {
		factories
			.getUserInfo(auth._id)
			.then(data => {
				login(data)
			})
			.catch(err => {
				ToastNotiError(err.response?.data?.message)
			})
	}

	const handleImageChange = event => {
		const file = event.target.files?.[0]
		if (file) {
			setValue('photoFile', file)
			const fileReader = new FileReader()
			fileReader.onloadend = () => {
				setValue('profilePictureUrl', fileReader.result)
			}
			fileReader.readAsDataURL(file)
		}
	}

	return (
		<div className="mx-auto my-20 flex justify-center">
			<div className="flex w-full max-w-[60%] gap-4 rounded-lg border bg-white p-4 shadow-lg">
				<div className="w-fit">
					<Sidebar active="1" />
				</div>
				<div className="flex flex-grow">
					<div className="w-full">
						<FormProvider {...methods}>
							<form onSubmit={methods.handleSubmit(handleSave)}>
								<div className="flex w-full flex-col gap-4">
									<div className="flex flex-row justify-between p-2">
										<div className="relative flex h-[90px] w-full justify-end">
											<div className="absolute flex h-[120px] w-32 justify-end">
												<Button
													color="danger"
													className="absolute right-3 top-1"
												>
													Thay đổi
												</Button>
												<input
													type="file"
													className="absolute inset-0 cursor-pointer opacity-0"
													onChange={handleImageChange}
												/>
											</div>
										</div>
										<Avatar
											showFallback
											src={watch('profilePictureUrl')}
											className="h-24 w-28 rounded-full"
										/>
										<div className="absolute bottom-1 right-1">
											<i
												className="fa fa-camera"
												aria-hidden="true"
											></i>
										</div>
									</div>

									<div className="flex flex-col gap-4">
										<InputField
											label={'Họ và tên'}
											placeholder="Nhập họ và tên"
											name={'fullName'}
											validate={{required: 'Bắt buộc chọn'}}
											register={register}
											isRequired
											errors={errors}
										/>
										<InputField
											placeholder="Nhập số điện thoại"
											label={'Số điện thoại'}
											name={'phone'}
											register={register}
											maxLength={10}
											errors={errors}
										/>
										<DatePickerField
											placeholder="Nhập ngày sinh"
											label={'Ngày sinh'}
											name={'dob'}
											isRequired
											register={register}
											errors={errors}
										/>
									</div>
									<ButtonGroup className="w-full">
										<Button
											className="w-full"
											variant="solid"
											color={watch('gender') === 1 ? 'primary' : 'default'}
											onClick={() => setValue('gender', 1)}
										>
											Nam
										</Button>
										<Button
											className="w-full"
											onClick={() => setValue('gender', 2)}
											variant="solid"
											color={watch('gender') === 2 ? 'primary' : 'default'}
										>
											Nữ
										</Button>
										<Button
											onClick={() => setValue('gender', 3)}
											color={watch('gender') === 3 ? 'primary' : 'default'}
											className="w-full"
											variant="solid"
										>
											Khác
										</Button>
									</ButtonGroup>
									<Divider />
									<Button
										color="primary"
										type="submit"
										isLoading={loading}
									>
										{'Lưu thông tin'}
									</Button>
								</div>
							</form>
						</FormProvider>
					</div>
				</div>
			</div>
		</div>
	)
}
