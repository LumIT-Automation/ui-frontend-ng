import { configureStore } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

import authenticationReducer from './store.authentication'
import errorReducer from './store.error'
import authorizationsReducer from './store.authorizations'
import permissionsReducer from './store.permissions'

import f5Reducer from './store.f5'
import infobloxReducer from './store.infoblox'
import fortinetdbReducer from './store.fortinetdb'


export default configureStore({
    reducer: {
        authentication: authenticationReducer,
        error: errorReducer,
        authorizations: authorizationsReducer,
        permissions: permissionsReducer,
        f5: f5Reducer,
        infoblox: infobloxReducer,
        fortinetdb: fortinetdbReducer,
    }
})
