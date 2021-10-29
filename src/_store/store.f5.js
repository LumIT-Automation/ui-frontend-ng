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


const f5Slice = createSlice({
    name: 'f5',
    initialState: {},
    reducers: {
        setPermissionsLoading: (state, action) => {
          state.permissionsLoading = action.payload
        },
        setPermissions: (state, action) => {
          state.permissions = action.payload
        },
        setPermissionsFetch: (state, action) => {
          state.permissionsFetch = action.payload
        },

        setIdentityGroupsLoading: (state, action) => {
          state.identityGroupsLoading = action.payload
        },
        setIdentityGroups: (state, action) => {
          state.identityGroups = action.payload.data.items
        },
        setIdentityGroupsFetch: (state, action) => {
          state.identityGroupsFetch = action.payload
        },

        setEnvironment: (state, action) => {
          state.environment = action.payload
        },

        setAssetsLoading: (state, action) => {
          state.assetsLoading = action.payload
        },
        setAssets: (state, action) => {
          state.assets = action.payload.data.items
        },
        setAssetsFetch: (state, action) => {
          state.assetsFetch = action.payload
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
        setPartitionsFetch: (state, action) => {
          state.partitionsFetch = action.payload
        },
        clearPartitions: (state, action) => {
          state.partitions = null
        },

        setRouteDomainsLoading: (state, action) => {
          state.routeDomainsLoading = action.payload
        },
        setRouteDomains: (state, action) => {
          state.routeDomains = action.payload.data.items
        },
        setRouteDomainsFetch: (state, action) => {
          state.routeDomainsFetch = action.payload
        },

        setPartition: (state, action) => {
          state.partition = action.payload
        },


        setNodesLoading: (state, action) => {
          state.nodesLoading = action.payload
        },
        setNodes: (state, action) => {
          state.nodes = action.payload.data.items
        },
        setNodesFetch: (state, action) => {
          state.nodesFetch = action.payload
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
        setMonitorsFetch: (state, action) => {
          state.monitorsFetch = action.payload
        },


        setPoolsLoading: (state, action) => {
          state.poolsLoading = action.payload
        },
        setPools: (state, action) => {
          state.pools = action.payload.data.items
        },
        setPoolsFetch: (state, action) => {
          state.poolsFetch = action.payload
        },

        setPoolMembersLoading: (state, action) => {
          state.poolMembersLoading = action.payload
        },
        setPoolMembers: (state, action) => {
          state.poolMembers = action.payload.data.items
        },
        setPoolMembersFetch: (state, action) => {
          state.poolMembersFetch = action.payload
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
        setProfilesFetch: (state, action) => {
          state.profilesFetch = action.payload
        },



        setVirtualServersLoading: (state, action) => {
          state.virtualServersLoading = action.payload
        },
        setVirtualServers: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        setVirtualServersFetch: (state, action) => {
          state.virtualServersFetch = action.payload
        },



        setCertificatesLoading: (state, action) => {
          state.certificatesLoading = action.payload
        },
        setCertificates: (state, action) => {
          state.certificates = action.payload.data.items
        },
        setCertificatesFetch: (state, action) => {
          state.certificatesFetch = action.payload
        },

        setKeysLoading: (state, action) => {
          state.keysLoading = action.payload
        },
        setKeys: (state, action) => {
          state.keys = action.payload.data.items
        },
        setKeysFetch: (state, action) => {
          state.keysFetch = action.payload
        },

        setCurrentPools: (state, action) => {
          state.currentPools = action.payload.data.items
          //state.currentPoolList = undefined
        },

        resetObjects: (state, action) => {

          state.nodesLoading= null
          state.nodes = null
          state.nodesFetch = null

          state.monitorTypes= null
          state.monitorsLoading= null
          state.monitors = null
          state.monitorsFetch = null

          state.poolsLoading = null
          state.pools = null
          state.poolsFetch = null

          state.poolMembersLoading = null
          state.poolMembers = null
          state.poolMembersFetch = null

          state.profileTypes = null
          state.profilesLoading = null
          state.profiles = null
          state.profilesFetch = null

          state.virtualServersLoading = null
          state.virtualServers = null
          state.virtualServersFetch = null

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
  setPermissionsLoading,
  setPermissions,
  setPermissionsFetch,

  setIdentityGroupsLoading,
  setIdentityGroups,
  setIdentityGroupsFetch,

  setEnvironment,

  setAssetsLoading,
  setAssets,
  setAssetsFetch,

  setAsset,

  setPartitionsLoading,
  setPartitions,
  setPartitionsFetch,
  clearPartitions,

  setRouteDomainsLoading,
  setRouteDomains,
  setRouteDomainsFetch,

  setPartition,

  setNodesLoading,
  setNodes,
  setNodesFetch,

  setMonitorTypes,
  setMonitorsLoading,
  setMonitors,
  setMonitorsFetch,

  setPoolsLoading,
  setPools,
  setCurrentPools,
  setPoolsFetch,

  setPoolMembersLoading,
  setPoolMembers,
  setPoolMembersFetch,

  setProfileTypes,
  setProfilesLoading,
  setProfiles,
  setProfilesFetch,

  setVirtualServersLoading,
  setVirtualServers,
  setVirtualServersFetch,

  setCertificatesLoading,
  setCertificates,
  setCertificatesFetch,

  setKeysLoading,
  setKeys,
  setKeysFetch,

  resetObjects,
  cleanUp
} = actions

export default reducer
