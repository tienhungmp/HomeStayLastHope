import {Flex} from '@chakra-ui/react'
import {Spinner} from '@nextui-org/react'
import React from 'react'

export default function Loading() {
	return (
		<Flex
			justifyContent={'center'}
			marginTop={15}
		>
			<Spinner />
		</Flex>
	)
}
