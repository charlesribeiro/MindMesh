import { authHandlers } from './authHandlers'
import { submitIntakeHandler } from './submitIntakeHandler'

export { resetMswAuthSession, setMswAuthSession } from './authHandlers'

export const handlers = [...authHandlers, submitIntakeHandler]
