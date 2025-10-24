import {parseDate} from '@internationalized/date'
import {Avatar, Button, ButtonGroup, Card, Divider} from '@nextui-org/react'
import {getDate, ToastInfo, ToastNotiError, uploadFirebase} from '@utils/Utils'
import {useEffect, useState} from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import DatePickerField from '../../components/common/DatePickerField'
import InputField from '../../components/common/InputField'
import {useModalCommon} from '../../context/ModalContext'
import {factories} from '../../factory'

export default function EditUserModal({auth, onReload}) {
	const methods = useForm()
	const {onClose} = useModalCommon()

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
			setValue('fullName', auth?.fullName || '')
			setValue('profilePictureUrl', auth?.profilePictureUrl || '')
			setValue('phone', auth?.phone || '')
			setValue('dob', auth?.dob ? parseDate(auth?.dob) : null)
			setValue('gender', auth?.gender || '')
			setValue('email', auth?.email || '')
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
			dob: getDate(values.dob, 7) ?? null,
			bossId: auth?.bossId ?? '',
		}
		factories
			.updateUserInfo(auth._id, newValues)
			.then(() => {
				ToastInfo('Cập nhật thông tin thành công')
				setLoading(false)
				onReload?.()
				onClose()
			})
			.catch(err => {
				if (err.response?.data?.message) {
					ToastNotiError(err.response?.data?.message)
				}
				setLoading(false)
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
		<div className="flex flex-grow pb-10">
			<Card className="w-full p-4">
				<FormProvider {...methods}>
					<form onSubmit={methods.handleSubmit(handleSave)}>
						<div className="flex w-full flex-col gap-5">
							<div className="flex flex-row justify-between p-2">
								<h5 className="text-2xl font-bold">Thông tin cá nhân</h5>
								<div className="relative h-16 w-16 cursor-pointer">
									<Avatar
										showFallback
										src={watch('profilePictureUrl')}
										className="h-14 w-14 rounded-full"
									/>
									<div className="absolute bottom-1 right-1">
										<i
											class="fa fa-camera"
											aria-hidden="true"
										></i>
									</div>
									<input
										type="file"
										className="absolute inset-0 cursor-pointer opacity-0"
										onChange={handleImageChange}
									/>
								</div>
							</div>

							<div className="flex gap-4">
								<InputField
									label={'Họ và tên'}
									placeholder="Nhập họ và tên"
									name={'fullName'}
									register={register}
									isRequired
									errors={errors}
								/>
								<InputField
									placeholder="Nhập số điện thoại"
									label={'Số điện thoại'}
									name={'phone'}
									isRequired
									register={register}
									errors={errors}
								/>
							</div>
							<div className="flex gap-4">
								<InputField
									placeholder="Nhập email"
									label={'Email'}
									isRequired
									name={'email'}
									register={register}
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
			</Card>
		</div>
	)
}
