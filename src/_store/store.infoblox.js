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


const infobloxSlice = createSlice({
    name: 'infoblox',
    initialState: {},
    reducers: {


        setInfobloxAssetsLoading: (state, action) => {
          state.infobloxAssetsLoading = action.payload
        },
        setInfobloxAssets: (state, action) => {
          state.infobloxAssets = action.payload.data.items
        },
        setInfobloxAssetsFetchStatus: (state, action) => {
          state.infobloxAssetsFetchStatus = action.payload
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
        setNodes: (state, action) => {
          state.nodes = action.payload.data.items
        },
        setPools: (state, action) => {
          state.pools = action.payload.data.items
        },
        setMonitorsList: (state, action) => {
          state.monitors = action.payload.data.items
        },
        setProfilesList: (state, action) => {
          state.profiles = action.payload.data.items
        },
        setVirtualServers: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        setCertificates: (state, action) => {
          state.certificates = action.payload.data.items
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

const { actions, reducer } = infobloxSlice;

export const {

  setInfobloxAssetsLoading,
  setInfobloxAssets,
  setInfobloxAssetsFetchStatus,

  selectAsset,
  setPartitions,
  selectPartition,
  setNodes,
  setMonitorsList,
  setPools,
  setPoolList,
  setProfilesList,
  setVirtualServers,
  setCertificates,
  cleanUp
} = actions

export default reducer
