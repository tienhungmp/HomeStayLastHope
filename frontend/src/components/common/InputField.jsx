import {Input} from '@nextui-org/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'

const InputField = ({type = 'text', placeholder = '', name, label, disabled, validate = {}, className = '', ...props}) => {
	const {register, formState, watch} = useFormContext()
	const error = formState.errors?.[name]?.message

	return (
		<div className="flex w-full flex-col">
			<Input
				type={type}
				label={label}
				placeholder={placeholder}
				isDisabled={disabled}
				className={`w-full bg-transparent ${className}`}
				color={error ? 'danger' : 'default'}
				errorMessage={error}
				value={watch(name)}
				{...register(name, validate)}
				{...props}
			/>
			{error && <p className="text-sm text-red">{error}</p>}
		</div>
	)
}

export default InputField
