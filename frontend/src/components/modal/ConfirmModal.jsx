import {Button} from '@nextui-org/react'
import {useModalCommon} from '../../context/ModalContext'

export default function ConfirmModal({content, onSubmit}) {
	const {onClose} = useModalCommon()
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-row">
				<p>{content}</p>
			</div>
			<div className="flex flex-row justify-end">
				<Button
					color="danger"
					variant="light"
					onPress={onClose}
				>
					Hủy bỏ
				</Button>
				<Button
					color="primary"
					onPress={() => {
						onClose()
						onSubmit()
					}}
				>
					Xác nhận
				</Button>
			</div>
		</div>
	)
}
