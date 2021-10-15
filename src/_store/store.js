import { configureStore } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

import authReducer from './store.auth'
import errorsReducer from './store.errors'
import authorizationsReducer from './store.authorizations'
import permissionsReducer from './store.permissions'

import f5Reducer from './store.f5'
import infobloxReducer from './store.infoblox'
import workflowsReducer from './store.workflows'

/*
store.js configures (configureStore) the store by defining its reducers:
ssoAuth, f5.
*/

export default configureStore({
    reducer: {
        ssoAuth: authReducer,
        errors: errorsReducer,
        authorizations: authorizationsReducer,
        permissions: permissionsReducer,
        f5: f5Reducer,
        infoblox: infobloxReducer,
        workflows: workflowsReducer
    }
})
