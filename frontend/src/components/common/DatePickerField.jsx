import {getLocalTimeZone, now, parseDateTime} from '@internationalized/date'
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
	showMonthAndYearPickers = true,
	granularity = 'day',
	...props
}) => {
	const {watch, setValue} = useFormContext()

	// Format hiển thị custom theo DD/MM/YYYY HH:mm
	const formatDisplayValue = (date) => {
		if (!date) return ''
		
		const day = String(date.day).padStart(2, '0')
		const month = String(date.month).padStart(2, '0')
		const year = date.year
		
		if (granularity === 'minute' || granularity === 'hour') {
			const hour = String(date.hour || 0).padStart(2, '0')
			const minute = String(date.minute || 0).padStart(2, '0')
			return `${day}/${month}/${year} ${hour}:${minute}`
		}
		
		return `${day}/${month}/${year}`
	}

	const currentValue = watch(name)

	return (
		<div className="relative w-full">
			<DatePicker
				type={type}
				hideTimeZone={hideTimeZone}
				minValue={minValue}
				defaultValue={isHaveTime && now(getLocalTimeZone())}
				placeholder={placeholder}
				className={`w-full min-w-72 bg-transparent ${className}`}
				color={errors?.[name] ? 'danger' : 'default'}
				errorMessage={errors?.[name] && 'Bắt buộc nhập thông tin'}
				value={currentValue ? currentValue : undefined}
				onChange={value => setValue(name, value)}
				showMonthAndYearPickers={showMonthAndYearPickers}
				granularity={granularity}
				{...props}
			/>
			{/* Hiển thị format đẹp bên dưới */}
			{currentValue && (
				<div className="mt-1 text-xs text-gray-500">
					{formatDisplayValue(currentValue)}
				</div>
			)}
		</div>
	)
}

export default DatePickerField