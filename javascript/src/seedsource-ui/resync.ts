import { v4 as uuidv4 } from 'uuid'
import { get, post, put, ioDelete } from './io'

class Request {
  promiseUUID?: string

  handlePromise(promise: Promise<Response>) {
    const { promiseUUID } = this

    return promise.then(response => {
      if (promiseUUID === this.promiseUUID) {
        return response
      }
      return Promise.reject()
    })
  }

  get(url: string) {
    return this.handlePromise(get(url))
  }

  post(url: string, data: any, options: any) {
    return this.handlePromise(post(url, data, options))
  }

  put(url: string, data: any, options: any) {
    return this.handlePromise(put(url, data, options))
  }

  ioDelete(url: string, options: any) {
    return this.handlePromise(ioDelete(url, options))
  }
}

export default (
  store: any,
  select: (state: any) => any,
  fetchData: (currentState: any, io: Request, dispatch: any, previousState: any) => any,
) => {
  let currentState: any
  const io = new Request()

  return store.subscribe(() => {
    const nextState = select(store.getState())

    if (JSON.stringify(nextState) !== JSON.stringify(currentState)) {
      const previousState = currentState

      currentState = nextState
      io.promiseUUID = uuidv4()

      fetchData(currentState, io, store.dispatch, previousState)
    }
  })
}
