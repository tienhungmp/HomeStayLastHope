import React, {useEffect, useState} from 'react'
import {useFormContext} from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function InputQuillForm({name, defaultValue, label, placeholder = '', validate = {}, ...props}) {
	const {formState, setValue} = useFormContext()

	const [content, setContent] = useState('')
	const handleContentChange = value => {
		setContent(value)
		setValue(name, value)
	}

	useEffect(() => {
		if (defaultValue) {
			handleContentChange(defaultValue)
		}
	}, [defaultValue])
	const modules = {
		toolbar: [
			[{header: [1, 2, 3, false]}],
			['bold', 'italic', 'underline', 'strike'],
			[{list: 'ordered'}, {list: 'bullet'}],
			['link', 'color', 'image'],
			[{indent: '-1'}, {indent: '+1'}],
			['clean'],
		],
	}
	const formats = [
		'header',
		'bold',
		'italic',
		'underline',
		'strike',
		'blockquote',
		'list',
		'bullet',
		'link',
		'indent',
		'image',
		'code-block',
		'color',
	]

	const error = formState.errors?.[name]?.message
	return (
		<div className="w-full rounded-md bg-neutral-100 p-3">
			<p className="mb-2 text-sm">{label}</p>
			<ReactQuill
				theme="snow"
				value={content}
				onChange={handleContentChange}
				modules={modules}
				formats={formats}
				placeholder={placeholder ? placeholder : 'Viết nội dung ở đây...'}
				className="bg-white"
			/>
			{error && <p className="text-sm text-red">{error}</p>}
		</div>
	)
}
