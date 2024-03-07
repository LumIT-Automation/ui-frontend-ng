import { configureStore } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

import concertoReducer from '../concerto/store'
import authenticationReducer from './store.authentication'
import errorReducer from './store.error'
import authorizationsReducer from './store.authorizations'

import workflowReducer from '../workflow/store'
import infobloxReducer from '../infoblox/store'
import checkpointReducer from '../checkpoint/store'
import f5Reducer from '../f5/store'
import f5bisReducer from '../f5bis/store'
import vmwareReducer from '../vmware/store'
import proofpointReducer from '../proofpoint/store'


export default configureStore({
  reducer: {
    concerto: concertoReducer,
    authentication: authenticationReducer,
    authorizations: authorizationsReducer,
    error: errorReducer,
    workflow: workflowReducer,
    infoblox: infobloxReducer,
    checkpoint: checkpointReducer,
    f5: f5Reducer,
    f5bis: f5bisReducer,
    vmware: vmwareReducer,
    proofpoint: proofpointReducer,
  }
})
