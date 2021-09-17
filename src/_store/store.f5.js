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
        setEnvironment: (state, action) => {
          state.environment = action.payload
        },
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


        setNodesLoading: (state, action) => {
          state.nodesLoading = action.payload
        },
        setNodesList: (state, action) => {
          state.nodes = action.payload.data.items
        },
        setNodesFetchStatus: (state, action) => {
          state.nodesFetchStatus = action.payload
        },

        setMonitorsTypeList: (state, action) => {
          state.monitorsTypeList = action.payload.data.items
        },
        setMonitorsList: (state, action) => {
          state.monitors = action.payload
        },
        setMonitorsFetchStatus: (state, action) => {
          state.monitorsFetchStatus = action.payload
        },

        setPoolsLoading: (state, action) => {
          state.poolsLoading = action.payload
        },
        setPoolsList: (state, action) => {
          state.pools = action.payload.data.items
        },
        setPoolsFetchStatus: (state, action) => {
          state.poolsFetchStatus = action.payload
        },

        setProfilesTypeList: (state, action) => {
          state.profilesTypeList = action.payload.data.items
        },
        setProfilesList: (state, action) => {
          state.profiles = action.payload
        },
        setProfilesFetchStatus: (state, action) => {
          state.profilesFetchStatus = action.payload
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

        resetObjects: (state, action) => {
          console.log('reset')
          state.nodes = null
          state.monitorsTypeList = null
          state.monitors = null
          state.monitorsFetchStatus = null
          state.pools = null
          state.poolsFetchStatus = null
          state.profilesTypeList = null
          state.profiles = null
          state.profilesFetchStatus = null
          state.virtualServers = null
          state.certificates = null
          state.keys = null
          state.currentPoolList = null
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
  setEnvironment,
  setAssetList,
  selectAsset,
  setPartitions,
  selectPartition,


  setNodesLoading,
  setNodesList,
  setNodesFetchStatus,

  setMonitorsTypeList,
  setMonitorsList,
  setMonitorsFetchStatus,

  setPoolsLoading,
  setPoolsList,
  setPoolList,
  setPoolsFetchStatus,

  setProfilesTypeList,
  setProfilesList,
  setProfilesFetchStatus,

  setVirtualServersList,
  setCertificatesList,
  setKeysList,

  resetObjects,
  cleanUp
} = actions

export default reducer
