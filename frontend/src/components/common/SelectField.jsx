import {Select, SelectItem} from '@nextui-org/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'

const SelectField = ({name, options, label, isRequired, placeholder = '', className = '', validate = {}}) => {
	const {register, formState, watch} = useFormContext()
	const error = formState.errors?.[name]?.message
	return (
		<div className="flex w-full flex-col">
			<Select
				placeholder={placeholder}
				label={label}
				isRequired={isRequired}
				className={`w-full bg-transparent ${className}`}
				color={error ? 'danger' : 'default'}
				value={watch[name]}
				errorMessage={error}
				{...register(name, validate)}
			>
				{options.map(option => (
					<SelectItem key={option.id || option.value}>{option.label ?? option?.name}</SelectItem>
				))}
			</Select>
			{error && <p className="text-sm text-red">{error}</p>}
		</div>
	)
}

export default SelectField
