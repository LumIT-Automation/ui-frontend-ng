import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*
create Slice creates a small piece of the store, in this case the slice for the balancers.
It has a name, an initial state, and several methods that set the state,
  setAssets
  setAsset
  setPartitions
  setPartition
  cleanUp
Methods (called actions) must be exported.
*/


const workflowsSlice = createSlice({
    name: 'workflows',
    initialState: {},
    reducers: {
        setWorkflowStatus: (state, action) => {
          state.workflowStatus = action.payload
        }
    }
})

const { actions, reducer } = workflowsSlice;

export const {
  setWorkflowStatus,
} = actions

export default reducer
