import apiClient from '~/services/apiService'
import { eventBus } from '~/services/eventBus'

// Add an interceptor to Axios to handle response errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Emit an event when an error occurs
    eventBus.emit('api-error', error)
    return Promise.reject(error)
  }
)

export { apiClient, eventBus }
