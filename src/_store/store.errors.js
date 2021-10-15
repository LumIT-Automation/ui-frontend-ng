import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*
create Slice creates a small piece of the store, in this case the slice for the balancers.
It has a name, an initial state, and several methods that set the state,
  setAssets
  setAsset
  setPartitions
  setPartition
  setPoolList
  cleanUp
Methods (called actions) must be exported.
*/


const errorsSlice = createSlice({
    name: 'errors',
    initialState: {},
    reducers: {

        setErrorsLoading: (state, action) => {
          state.errorsLoading = action.payload
        },
        setErrors: (state, action) => {
          state.errors = action.payload
        },
        setErrorsFetch: (state, action) => {
          state.errorsFetch = action.payload
        },


        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = errorsSlice;

export const {

  setErrorsLoading,
  setErrors,
  setErrorsFetch,

  setAsset,

  cleanUp
} = actions

export default reducer
