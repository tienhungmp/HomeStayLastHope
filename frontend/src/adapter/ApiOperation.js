import ApiCore from './ApiCore'
import {BASE_PREFIX} from './ApiConstants'

const ApiOperation = new ApiCore({
	fetchAll: true,
	fetchSingle: true,
	post: true,
	patch: true,
	remove: true,
	url: BASE_PREFIX,
	request: true,
})

export default ApiOperation
