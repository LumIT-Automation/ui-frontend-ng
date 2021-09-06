import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

/*
create Slice creates a small piece of the store, in this case the slice for the balancers.
It has a name, an initial state, and several methods that set the state,
  setAssetList
  selectAsset
  setPartitions
  selectPartition
  setPoolList
  cleanUp
Methods (called actions) must be exported.
*/


const f5Slice = createSlice({
    name: 'f5',
    initialState: {},
    reducers: {
        setAssetList: (state, action) => {
          state.assetList = action.payload.data.items
        },
        selectAsset: (state, action) => {
          state.asset = action.payload
        },
        setPartitions: (state, action) => {
          state.assetPartitions = action.payload.data.items
        },
        selectPartition: (state, action) => {
          state.partition = action.payload
        },
        setNodesList: (state, action) => {
          state.nodes = action.payload.data.items
        },
        setPoolsList: (state, action) => {
          console.log(action.payload.data.items)
          state.pools = action.payload.data.items
        },
        setMonitorsList: (state, action) => {
          state.monitors = action.payload.data.items
        },
        setProfilesList: (state, action) => {
          state.profiles = action.payload.data.items
        },
        setVirtualServersList: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        setCertificatesList: (state, action) => {
          state.certificates = action.payload.data.items
        },
        setKeysList: (state, action) => {
          state.keys = action.payload.data.items
        },
        setPoolList: (state, action) => {
          state.currentPoolList = action.payload.data.items
          //state.currentPoolList = undefined
        },


        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = f5Slice;

export const {
  setAssetList,
  selectAsset,
  setPartitions,
  selectPartition,
  setNodesList,
  setMonitorsList,
  setPoolsList,
  setPoolList,
  setProfilesList,
  setVirtualServersList,
  setCertificatesList,
  setKeysList,
  cleanUp
} = actions

export default reducer
