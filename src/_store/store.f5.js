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
        setNodes: (state, action) => {
          state.nodes = action.payload.data.items
        },
        setNodesFetchStatus: (state, action) => {
          state.nodesFetchStatus = action.payload
        },

        setMonitorTypesLoading: (state, action) => {
          state.monitorTypesLoading = action.payload.data.items
        },
        setMonitorTypes: (state, action) => {
          state.monitorTypes = action.payload.data.items
        },

        setMonitorsLoading: (state, action) => {
          state.monitorsLoading = action.payload
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
        setPools: (state, action) => {
          state.pools = action.payload.data.items
        },
        setPoolsFetchStatus: (state, action) => {
          state.poolsFetchStatus = action.payload
        },

        setProfileTypes: (state, action) => {
          state.profileTypes = action.payload.data.items
        },
        setProfilesList: (state, action) => {
          state.profiles = action.payload
        },
        setProfilesFetchStatus: (state, action) => {
          state.profilesFetchStatus = action.payload
        },



        setVirtualServersLoading: (state, action) => {
          state.virtualServersLoading = action.payload
        },
        setVirtualServers: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        setVirtualServersFetchStatus: (state, action) => {
          state.virtualServersFetchStatus = action.payload
        },



        setCertificates: (state, action) => {
          state.certificates = action.payload.data.items
        },
        setKeys: (state, action) => {
          state.keys = action.payload.data.items
        },

        setPoolList: (state, action) => {
          state.currentPoolList = action.payload.data.items
          //state.currentPoolList = undefined
        },

        resetObjects: (state, action) => {
          console.log('reset')

          state.nodesLoading= null
          state.nodes = null
          state.nodesFetchStatus = null

          state.monitorTypes = null
          state.monitorsTypeLoading

          state.monitorsLoading= null
          state.monitors = null
          state.monitorsFetchStatus = null

          state.poolsLoading = null
          state.pools = null
          state.poolsFetchStatus = null

          state.profileTypes = null
          state.profiles = null
          state.profilesFetchStatus = null

          state.virtualServersLoading = null
          state.virtualServers = null
          state.virtualServersFetchStatus = null

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
  setNodes,
  setNodesFetchStatus,

  setMonitorsTypeLoading,
  setMonitorTypes,

  setMonitorsLoading,
  setMonitorsList,
  setMonitorsFetchStatus,

  setPoolsLoading,
  setPools,
  setPoolList,
  setPoolsFetchStatus,

  setProfileTypes,
  setProfilesList,
  setProfilesFetchStatus,

  setVirtualServersLoading,
  setVirtualServers,
  setVirtualServersFetchStatus,

  setCertificates,
  setKeys,

  resetObjects,
  cleanUp
} = actions

export default reducer
