import {Flex} from '@chakra-ui/react'
import {Pagination} from '@nextui-org/react'
import React from 'react'

export default function PaginationCustom({total, setPage}) {
	return (
		<Flex
			justifyContent={'flex-end'}
			marginTop={5}
		>
			<Pagination
				total={total}
				onChange={e => setPage(e)}
			/>
		</Flex>
	)
}
