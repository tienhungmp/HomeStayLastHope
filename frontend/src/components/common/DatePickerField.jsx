import {getLocalTimeZone, now} from '@internationalized/date'
import {DatePicker} from '@nextui-org/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'
const DatePickerField = ({
	type = 'text',
	placeholder = '',
	name = '',
	hideTimeZone = true,
	register,
	errors,
	className = '',
	isHaveTime,
	minValue,
	...props
}) => {
	const {watch, setValue} = useFormContext()

	return (
		<>
			<DatePicker
				type={type}
				hideTimeZone={hideTimeZone}
				minValue={minValue}
				defaultValue={isHaveTime && now(getLocalTimeZone())}
				placeholder={placeholder}
				className={`w-full min-w-72 bg-transparent ${className}`}
				color={errors?.[name] ? 'danger' : 'default'}
				errorMessage={errors?.[name] && 'Bắt buộc nhập thông tin'}
				value={watch(name) ? watch(name) : undefined}
				onChange={value => setValue(name, value)}
				{...props}
			/>
		</>
	)
}

export default DatePickerField
