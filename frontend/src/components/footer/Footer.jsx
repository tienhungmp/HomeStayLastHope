import {
	Box,
	Container,
	Stack,
	SimpleGrid,
	Text,
	VisuallyHidden,
	chakra,
	useColorModeValue,
	Flex,
	Icon,
	Link,
} from '@chakra-ui/react'
import { FaFacebook, FaTiktok, FaInstagram } from 'react-icons/fa'

const ListHeader = ({ children }) => (
	<Text
		fontWeight="600"
		fontSize="md"
		mb={4}
		textTransform="uppercase"
		letterSpacing="wider"
		color={useColorModeValue('gray.600', 'gray.300')}
	>
		{children}
	</Text>
)

const SocialButton = ({ children, label, href }) => (
	<chakra.button
		bg={useColorModeValue('white', 'gray.700')}
		rounded="full"
		w={10}
		h={10}
		cursor="pointer"
		as="a"
		href={href}
		display="inline-flex"
		alignItems="center"
		justifyContent="center"
		transition="all 0.3s ease"
		boxShadow="md"
		_hover={{
			bg: useColorModeValue('gray.100', 'gray.600'),
			transform: 'translateY(-2px)',
			boxShadow: 'lg',
		}}
		_active={{ transform: 'scale(0.95)' }}
	>
		<VisuallyHidden>{label}</VisuallyHidden>
		{children}
	</chakra.button>
)

export default function LargeWithAppLinksAndSocial() {
	return (
		<Box
			bg={useColorModeValue('gray.50', 'gray.900')}
			color={useColorModeValue('gray.700', 'gray.200')}
		>
			<Container as={Stack} maxW="7xl" py={16}>
				<SimpleGrid
					templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
					spacing={{ base: 10, md: 16 }}
				>
					<Stack spacing={4}>
						<ListHeader>Homestay</ListHeader>
						<Link href="#" _hover={{ color: 'teal.400' }}>Về chúng tôi</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Cẩm nang du lịch</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Tuyển dụng</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Liên hệ</Link>
					</Stack>

					<Stack spacing={4}>
						<ListHeader>Hỗ trợ khách thuê</ListHeader>
						<Link href="#" _hover={{ color: 'teal.400' }}>Trung tâm trợ giúp</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Quy định an toàn</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Hướng dẫn đặt phòng</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Chính sách hủy</Link>
					</Stack>

					<Stack spacing={4}>
						<ListHeader>Hỗ trợ chủ nhà</ListHeader>
						<Link href="#" _hover={{ color: 'teal.400' }}>Đăng ký làm chủ nhà</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Quy định đăng tin</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Dịch vụ hỗ trợ</Link>
						<Link href="#" _hover={{ color: 'teal.400' }}>Bảo hiểm chủ nhà</Link>
					</Stack>

					<Stack spacing={4}>
						<ListHeader>Kết nối</ListHeader>
						<Text fontSize="sm">
							Theo dõi để cập nhật ưu đãi homestay mới nhất.
						</Text>
						<Flex gap={3}>
							<SocialButton label="Facebook" href="#">
								<Icon as={FaFacebook} color="#1877F2" />
							</SocialButton>
							<SocialButton label="TikTok" href="#">
								<Icon as={FaTiktok} color="#000000" />
							</SocialButton>
							<SocialButton label="Instagram" href="#">
								<Icon as={FaInstagram} color="#E4405F" />
							</SocialButton>
						</Flex>
					</Stack>
				</SimpleGrid>
			</Container>

			<Box
				borderTopWidth={1}
				borderStyle="solid"
				borderColor={useColorModeValue('gray.200', 'gray.700')}
			>
				<Container
					as={Flex}
					maxW="7xl"
					py={6}
					direction={{ base: 'column', md: 'row' }}
					justify="space-between"
					align="center"
				>
					<Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
						© 2024 Homestay Booking. Mọi quyền được bảo lưu.
					</Text>
					<Stack direction="row" spacing={6} mt={{ base: 4, md: 0 }}>
						<Link href="#" fontSize="sm" _hover={{ color: 'teal.400' }}>
							Chính sách bảo mật
						</Link>
						<Link href="#" fontSize="sm" _hover={{ color: 'teal.400' }}>
							Điều khoản dịch vụ
						</Link>
						<Link href="#" fontSize="sm" _hover={{ color: 'teal.400' }}>
							Liên hệ
						</Link>
					</Stack>
				</Container>
			</Box>
		</Box>
	)
}
