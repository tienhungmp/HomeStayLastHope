import InputField from '@components/common/InputField'
import InputQuillForm from '@components/common/InputQuillForm'
import SelectField from '@components/common/SelectField'
import UploadImages from '@components/common/UploadImage'
import {Button, Checkbox} from '@nextui-org/react'
import {AMENITIES, PROVINCES, TYPE_HOST} from '@utils/constants'
import {ToastInfo, ToastNotiError, uploadFirebase} from '@utils/Utils'
import React, {useEffect, useState} from 'react'
import {FormProvider, useForm} from 'react-hook-form'
import {useAuth} from '../../../context/AuthContext'
import {useModalCommon} from '../../../context/ModalContext'
import {factories} from '../../../factory'

export default function CreateAccommodationModal({onReload, item}) {
	const [isLoading, setIsLoading] = useState(false)
	const [amenities, setAmenities] = useState([])
	const [paymentMethods, setPaymentMethods] = useState([])
	const {auth} = useAuth()
	const {onClose} = useModalCommon()
	const methods = useForm()
	const {watch, setValue} = methods

	useEffect(() => {
		if (!item) return
		setAmenities(item.amenities)
		setValue('price', item.price)
		setValue('name', item.name)
		setValue('city', item.city)
		setValue('address', item.address)
		setValue('pricePerNight', item.pricePerNight)
		setValue('lat', item.lat)
		setValue('lng', item.lng)
		setValue('description', item.description)
		setValue('noteAccommodation', item.noteAccommodation)
		setValue('type', item.type)
		setValue('outstanding', item.outstanding)
		setValue('options', item.options)
		setValue('activities', item.activities)
		if (item?.images?.length > 0) {
			const newList = item?.images?.map(image => ({
				url: image,
				file: null,
			}))
			setValue('hostImage', newList)
		}
	}, [item])
	async function handleSave(values) {
		console.log('🚀 ~ handleSave ~ values:', values)
		setIsLoading(true)
		let data = {
			...values,
			ownerId: auth._id,
			pricePerNight: Number(values.pricePerNight),
			amenities: amenities,
			paymentMethods: paymentMethods,
		}
		if (values?.hostImage?.length > 0) {
			const newUrls = []
			for (const image of values?.hostImage) {
				if (image.url && !image.file) {
					newUrls.push(image.url)
					continue
				}
				if (!image.file) continue
				const newUrl = await uploadFirebase(image.file)
				newUrls.push(newUrl)
			}
			data.images = newUrls
		}
		if (item?._id) {
			factories
				.updateAccommodation(data, item._id)
				.then(() => {
					ToastInfo('Cập nhật chỗ nghỉ thành công')
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
		} else {
			factories
				.createNewAccommodation(data)
				.then(() => {
					ToastInfo('Tạo mới chỗ nghỉ thành công')
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
	}

	function handleChooseAmenity(id) {
		const newList = amenities.includes(id) ? amenities.filter(amenityId => amenityId !== id) : [...amenities, id]
		setAmenities(newList)
	}
	function handleChoosePayment(id) {
		const newList = paymentMethods.includes(id) ? paymentMethods.filter(paymentMethod => paymentMethod !== id) : [...paymentMethods, id]
		setPaymentMethods(newList)
	}
	return (
		<div className="flex flex-col gap-4 p-5 pt-0">
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(handleSave)}
					className="flex flex-col gap-4"
				>
					<div className="flex max-h-[70vh] flex-col gap-4 overflow-scroll">
						<div className="flex flex-row gap-2">
							<InputField
								placeholder="Nhập tên chỗ nghỉ"
								label="Tên chỗ nghỉ"
								isRequired
								validate={{required: 'Bắt buộc chọn'}}
								name={'name'}
							/>
							<SelectField
								options={PROVINCES || []}
								placeholder="Chọn thành phố"
								isRequired
								label="Thành phố"
								isMultiple
								validate={{required: 'Bắt buộc chọn'}}
								name={'city'}
							/>
						</div>
						<SelectField
							options={TYPE_HOST || []}
							placeholder="Chọn loại chỗ nghỉ"
							label="Loại hình"
							isRequired
							validate={{required: 'Bắt buộc chọn'}}
							name={'type'}
						/>
						<div className="flex flex-row gap-2">
							<InputField
								placeholder="Nhập địa chỉ"
								label="Địa chỉ"
								validate={{required: 'Bắt buộc chọn'}}
								isRequired
								name={'address'}
							/>
							{watch('type') <= 3 && (
								<InputField
									placeholder="0"
									label="Nhập giá mỗi đêm"
									isRequired
									validate={{required: 'Bắt buộc chọn'}}
									name={'pricePerNight'}
									type="number"
								/>
							)}
						</div>
						<div className="flex flex-row gap-2">
							<InputField
								placeholder="Nhập kinh độ"
								isRequired
								label="Kinh độ"
								validate={{required: 'Bắt buộc chọn'}}
								name={'lat'}
							/>
							<InputField
								placeholder="Nhập vĩ độ"
								isRequired
								label="Vĩ độ"
								validate={{required: 'Bắt buộc chọn'}}
								name={'lng'}
							/>
						</div>
						<UploadImages
							label="Hình ảnh"
							name={'hostImage'}
						/>
						<div className="rounded-lg bg-neutral-100 p-4">
							<p className="mb-2 text-sm">Tiện nghi</p>
							<div className="flex flex-wrap gap-4">
								{AMENITIES.map(x => (
									<div className="flex flex-row gap-1">
										<Checkbox
											key={x.id}
											isSelected={amenities.includes(x.id)}
											onValueChange={() => handleChooseAmenity(x.id)}
										/>
										<p className="text-sm text-neutral-700">{x.title}</p>
									</div>
								))}
							</div>
						</div>
						<InputQuillForm
							placeholder="Miêu tả"
							label="Miêu tả"
							defaultValue={item?.description}
							name={'description'}
						/>
						<InputQuillForm
							placeholder="Điểm nổi bật"
							label="Điểm nổi bật"
							name={'outstanding'}
							defaultValue={item?.outstanding}
						/>
						<InputQuillForm
							placeholder="Lựa chọn"
							label="Lựa chọn"
							defaultValue={item?.options}
							name={'options'}
						/>
						<InputQuillForm
							placeholder="Hoạt động"
							label="Hoạt động"
							defaultValue={item?.activities}
							name={'activities'}
						/>
						<InputQuillForm
							placeholder="Ghi chú quy định"
							label="Ghi chú"
							defaultValue={item?.noteAccommodation}
							name={'noteAccommodation'}
						/>
					</div>
					<Button
						isLoading={isLoading}
						type="submit"
					>
						{item?._id ? 'Cập nhật' : 'Tạo mới'}
					</Button>
				</form>
			</FormProvider>
		</div>
	)
}
