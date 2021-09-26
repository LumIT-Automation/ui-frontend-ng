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

        setAssetsLoading: (state, action) => {
          state.assetsLoading = action.payload
        },
        setAssets: (state, action) => {
          state.assets = action.payload.data.items
        },
        setAssetsFetchStatus: (state, action) => {
          state.assetsFetchStatus = action.payload
        },

        setAsset: (state, action) => {
          state.asset = action.payload
        },

        setPartitionsLoading: (state, action) => {
          state.partitionsLoading = action.payload
        },
        setPartitions: (state, action) => {
          state.partitions = action.payload.data.items
        },
        setPartitionsFetchStatus: (state, action) => {
          state.partitionsFetchStatus = action.payload
        },
/*
        setPartition: (state, action) => {
          state.partition = action.payload
        },
*/
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
          console.log(action.payload)
          state.nodesLoading = action.payload
        },
        setNodes: (state, action) => {
          console.log('nodes store')
          console.log(action.payload.data.items)
          state.nodes = action.payload.data.items
        },
        setNodesFetchStatus: (state, action) => {
          state.nodesFetchStatus = action.payload
        },

        setMonitorTypes: (state, action) => {
          state.monitorTypes = action.payload
        },
        setMonitorsLoading: (state, action) => {
          state.monitorsLoading = action.payload
        },
        setMonitors: (state, action) => {
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

        setPoolMembersLoading: (state, action) => {
          state.poolMembersLoading = action.payload
        },
        setPoolMembers: (state, action) => {
          state.poolMembers = action.payload.data.items
        },
        setPoolMembersFetchStatus: (state, action) => {
          state.poolMembersFetchStatus = action.payload
        },

        setProfileTypes: (state, action) => {
          state.profileTypes = action.payload
        },
        setProfilesLoading: (state, action) => {
          state.profilesLoading = action.payload
        },
        setProfiles: (state, action) => {
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

        setCurrentPools: (state, action) => {
          state.currentPools = action.payload.data.items
          //state.currentPoolList = undefined
        },

        resetObjects: (state, action) => {

          state.nodesLoading= null
          state.nodes = null
          state.nodesFetchStatus = null

          state.monitorTypes= null
          state.monitorsLoading= null
          state.monitors = null
          state.monitorsFetchStatus = null

          state.poolsLoading = null
          state.pools = null
          state.poolsFetchStatus = null

          state.poolMembersLoading = null
          state.poolMembers = null
          state.poolMembersFetchStatus = null

          state.profileTypes = null
          state.profilesLoading = null
          state.profiles = null
          state.profilesFetchStatus = null

          state.virtualServersLoading = null
          state.virtualServers = null
          state.virtualServersFetchStatus = null

          state.certificates = null
          state.keys = null

          state.currentPools = null
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

  setAssetsLoading,
  setAssets,
  setAssetsFetchStatus,

  setAsset,

  setPartitionsLoading,
  //setPartitions,
  setPartitionsFetchStatus,

  setPartition,

  selectAsset,
  setPartitions,
  selectPartition,


  setNodesLoading,
  setNodes,
  setNodesFetchStatus,

  setMonitorTypes,
  setMonitorsLoading,
  setMonitors,
  setMonitorsFetchStatus,

  setPoolsLoading,
  setPools,
  setCurrentPools,
  setPoolsFetchStatus,

  setPoolMembersLoading,
  setPoolMembers,
  setPoolMembersFetchStatus,

  setProfileTypes,
  setProfilesLoading,
  setProfiles,
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
