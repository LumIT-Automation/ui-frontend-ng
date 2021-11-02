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


const errorSlice = createSlice({
    name: 'error',
    initialState: {},
    reducers: {

        setErrorLoading: (state, action) => {
          state.errorLoading = action.payload
        },
        setError: (state, action) => {
          state.error = action.payload
        },
        setErrorFetch: (state, action) => {
          state.errorFetch = action.payload
        },
        setFetchF5AssetsError: (state, action) => {
          state.fetchF5AssetsError = action.payload
        },
        setDeleteF5AssetError: (state, action) => {
          state.deleteF5AssetError = action.payload
        },




        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = errorSlice;

export const {

  setErrorLoading,
  setError,
  setErrorFetch,
  setFetchF5AssetsError,
  setDeleteF5AssetError,

  cleanUp
} = actions

export default reducer
