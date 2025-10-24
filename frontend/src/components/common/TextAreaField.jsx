import {Textarea} from '@nextui-org/react'
import React from 'react'
import {useFormContext} from 'react-hook-form'

const TextAreaField = ({type = 'text', placeholder = '', name, className = '', errors, ...props}) => {
	const {register, watch} = useFormContext()
	return (
		<>
			<Textarea
				placeholder={placeholder}
				className={`w-full bg-transparent ${className}`}
				value={watch(name)}
				{...register(name)}
				{...props}
			/>
			{errors?.[name] && <span className="text-red">Bắt buộc nhập thông tin</span>}
		</>
	)
}

export default TextAreaField
