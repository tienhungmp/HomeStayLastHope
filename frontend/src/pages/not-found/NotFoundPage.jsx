import { Box, Heading, Text, Button, Link } from '@chakra-ui/react'

export default function NotFoundPage() {
	return (
		<Box
			textAlign="center"
			py={10}
			px={6}
			h={'65vh'}
			className="mx-auto flex max-w-96 flex-col items-center justify-center gap-4"
		>
			<Heading
				display="inline-block"
				as="h4"
				size="4xl"
				bgGradient="linear(to-r, teal.400, teal.600)"
				backgroundClip="text"
			>
				404
			</Heading>
			<Text
				fontSize="18px"
				mt={3}
				mb={2}
			>
				Page Not Found
			</Text>
			<Text
				color={'gray.500'}
				mb={6}
			>
				The page you&apos;re looking for does not seem to exist
			</Text>
			<Button
				as={'a'}
				href="/"
				maxW={'32'}
				bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
				color="white"
				variant="solid"
			>
				Go to Home
			</Button>
		</Box>
	)
}
