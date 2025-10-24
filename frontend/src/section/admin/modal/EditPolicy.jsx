import InputQuillForm from '@components/common/InputQuillForm'
import {Button, Checkbox, Spinner} from '@nextui-org/react'
import {PAYMENT_METHODS} from '@utils/constants'
import {ToastInfo, ToastNotiError, uploadFirebase} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import {useAuth} from '../../../context/AuthContext'
import {useModalCommon} from '../../../context/ModalContext'
import {factories} from '../../../factory'

export default function EditPolicyModal({onReload}) {
	const [isLoading, setIsLoading] = useState(false)
	const [isReady, setIsReady] = useState(false)
	const [amenities, setAmenities] = useState([])
	const [data, setData] = useState([])
	const [paymentMethods, setPaymentMethods] = useState([])
	const {auth} = useAuth()
	const {onClose} = useModalCommon()
	const methods = useForm()
	const {watch, setValue} = methods

	useEffect(() => {
		setValue('quantity', 20)
		setValue('capacity', 2)
		setValue('pricePerNight', 150000)
		setValue('name', 'Phòng Giường Đôi Lớn')
		loadList()
	}, [auth])

	function handleChoosePayment(id) {
		const newList = paymentMethods.includes(id) ? paymentMethods.filter(paymentMethod => paymentMethod !== id) : [...paymentMethods, id]
		setPaymentMethods(newList)
	}

	function loadList() {
		setIsReady(false)
		const params = {
			ownerId: auth._id,
			limit: 1000,
		}
		factories
			.getAdminListAccommodation(params)
			.then(data => {
				const list = data?.accommodations.map(item => ({
					value: item._id,
					label: item.name,
				}))
				setData(list)
				setIsReady(true)
			})
			.finally(() => setIsReady(true))
	}

	async function handleSave(values) {
		setIsLoading(true)
		let data = {
			checkIn,
			checkOut,
			cancellationPolicy,
			additionalPolicy,
			allowPetPolicy,
			ageLimitPolicy,
			paymentMethod: paymentMethods,
		}
		if (values?.hostImage?.length > 0) {
			const newUrls = []
			for (const image of values?.hostImage) {
				if (!image.url) continue
				const newUrl = await uploadFirebase(image.file)
				newUrls.push(newUrl)
			}
			data.images = newUrls
		}

		factories
			.createNewRoom(data)
			.then(() => {
				ToastInfo('Tạo mới phòng thành công')
				onClose()
				onReload()
				setIsLoading(false)
			})
			.catch(err => {
				if (err.response?.data?.message) {
					ToastNotiError(err.response?.data?.message)
				}
				setIsLoading(false)
			})
	}

	function handleChooseAmenity(id) {
		const newList = amenities.includes(id) ? amenities.filter(amenityId => amenityId !== id) : [...amenities, id]
		setAmenities(newList)
	}
	if (!isReady) {
		return <Spinner />
	}
	return (
		<div className="flex flex-col gap-4 p-5 pt-0">
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(handleSave)}
					className="flex flex-col gap-4"
				>
					<div className="flex max-h-[70vh] flex-col gap-4 overflow-scroll">
						<div className="rounded-lg bg-neutral-100 p-4">
							<p className="mb-2 text-sm">Phương thức thanh toán</p>
							<div className="flex flex-wrap gap-4">
								{PAYMENT_METHODS.map(x => (
									<div className="flex flex-row gap-1">
										<Checkbox
											key={x.id}
											isSelected={paymentMethods.includes(x.id)}
											onValueChange={() => handleChoosePayment(x.id)}
										/>
										<p className="text-sm text-neutral-700">{x.label}</p>
									</div>
								))}
							</div>
						</div>
						<InputQuillForm
							placeholder="Mô tả"
							label="Mô tả"
							name={'description'}
						/>
					</div>
					<Button
						isLoading={isLoading}
						type="submit"
						color="primary"
					>
						Tạo mới chỗ nghỉ
					</Button>
				</form>
			</FormProvider>
		</div>
	)
}
