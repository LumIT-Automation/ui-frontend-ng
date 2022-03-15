import { configureStore } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

import authenticationReducer from './store.authentication'
import errorReducer from './store.error'
import authorizationsReducer from './store.authorizations'

import f5Reducer from '../f5/store'
import infobloxReducer from '../infoblox/store'
import fortinetdbReducer from '../fortinetdb/store'


export default configureStore({
  reducer: {
    authentication: authenticationReducer,
    authorizations: authorizationsReducer,
    error: errorReducer,
    f5: f5Reducer,
    infoblox: infobloxReducer,
    fortinetdb: fortinetdbReducer,
  }
})
