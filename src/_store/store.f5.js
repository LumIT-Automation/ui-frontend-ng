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
        setPermissionsError: (state, action) => {
          state.permissionsError = action.payload
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
        setIdentityGroupsError: (state, action) => {
          state.identityGroupsError = action.payload
        },

        setEnvironment: (state, action) => {
          state.environment = action.payload
        },
        setEnvironmentError: (state, action) => {
          state.environmentError = action.payload
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
        setAssetsError: (state, action) => {
          state.assetsError = action.payload
        },

        setAsset: (state, action) => {
          state.asset = action.payload
        },
        setAssetAddError: (state, action) => {
          state.assetAddError = action.payload
        },
        setAssetModifyError: (state, action) => {
          state.assetModifyError = action.payload
        },
        setAssetDeleteError: (state, action) => {
          state.assetDeleteError = action.payload
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
        setPartitionsError: (state, action) => {
          state.partitionsError = action.payload
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
        setRouteDomainsError: (state, action) => {
          state.routeDomainsError = action.payload
        },

        setPartition: (state, action) => {
          state.partition = action.payload
        },
        setPartitionAddError: (state, action) => {
          state.partitionAddError = action.payload
        },
        setPartitionModifyError: (state, action) => {
          state.partitionModifyError = action.payload
        },
        setPartitionDeleteError: (state, action) => {
          state.partitionDeleteError = action.payload
        },


        nodesLoading: (state, action) => {
          state.nodesLoading = action.payload
        },
        nodes: (state, action) => {
          state.nodes = action.payload.data.items
        },
        nodesFetch: (state, action) => {
          state.nodesFetch = action.payload
        },
        nodesError: (state, action) => {
          state.nodesError = action.payload
        },
        addNodeError: (state, action) => {
          state.addNodeError = action.payload
        },
        deleteNodeError: (state, action) => {
          state.deleteNodeError = action.payload
        },

        monitorTypes: (state, action) => {
          state.monitorTypes = action.payload
        },
        monitorTypesError: (state, action) => {
          state.monitorTypesError = action.payload
        },

        monitorsLoading: (state, action) => {
          state.monitorsLoading = action.payload
        },
        monitors: (state, action) => {
          state.monitors = action.payload
        },
        monitorsFetch: (state, action) => {
          state.monitorsFetch = action.payload
        },
        monitorsError: (state, action) => {
          state.monitorsError = action.payload
        },
        addMonitorError: (state, action) => {
          state.addMonitorError = action.payload
        },
        modifyMonitorError: (state, action) => {
          state.modifyMonitorError = action.payload
        },
        deleteMonitorError: (state, action) => {
          state.deleteMonitorError = action.payload
        },


        poolsLoading: (state, action) => {
          state.poolsLoading = action.payload
        },
        pools: (state, action) => {
          state.pools = action.payload.data.items
        },
        poolsFetch: (state, action) => {
          state.poolsFetch = action.payload
        },
        poolsError: (state, action) => {
          state.poolsError = action.payload
        },
        addPoolError: (state, action) => {
          state.addPoolError = action.payload
        },
        modifyPoolError: (state, action) => {
          state.modifyPoolError = action.payload
        },
        deletePoolError: (state, action) => {
          state.deletePoolError = action.payload
        },

        poolMembersLoading: (state, action) => {
          state.poolMembersLoading = action.payload
        },
        poolMembers: (state, action) => {
          state.poolMembers = action.payload.data.items
        },
        poolMembersFetch: (state, action) => {
          state.poolMembersFetch = action.payload
        },
        poolMembersError: (state, action) => {
          state.poolMembersError = action.payload
        },
        addPoolMemberError: (state, action) => {
          state.addPoolMemberError = action.payload
        },
        modifyPoolMemberError: (state, action) => {
          state.modifyPoolMemberError = action.payload
        },
        deletePoolMemberError: (state, action) => {
          state.deletePoolMemberError = action.payload
        },

        profilesLoading: (state, action) => {
          state.profilesLoading = action.payload
        },
        profiles: (state, action) => {
          state.profiles = action.payload
        },
        profilesFetch: (state, action) => {
          state.profilesFetch = action.payload
        },
        profilesError: (state, action) => {
          state.profilesError = action.payload
        },
        addProfileError: (state, action) => {
          state.addProfileError = action.payload
        },
        deleteProfileError: (state, action) => {
          state.deleteProfileError = action.payload
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
        virtualServersError: (state, action) => {
          state.virtualServersError = action.payload
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
        setCertificatesError: (state, action) => {
          state.certificatesError = action.payload
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
        setKeysError: (state, action) => {
          state.keysError = action.payload
        },

        certificate: (state, action) => {
          state.certificate = action.payload
        },
        certificateAddError: (state, action) => {
          state.certificateAddError = action.payload
        },
        certificateModifyError: (state, action) => {
          state.certificateModifyError = action.payload
        },
        certificateDeleteError: (state, action) => {
          state.certificateDeleteError = action.payload
        },

        key: (state, action) => {
          state.key = action.payload
        },
        keyAddError: (state, action) => {
          state.keyAddError = action.payload
        },
        keyModifyError: (state, action) => {
          state.keyModifyError = action.payload
        },
        keyDeleteError: (state, action) => {
          state.keyDeleteError = action.payload
        },

        setCreateL4ServiceError: (state, action) => {
          state.createL4ServiceError = action.payload
        },
        setCreateL7ServiceError: (state, action) => {
          state.createL7ServiceError = action.payload
        },
        setDeleteServiceError: (state, action) => {
          state.deleteServiceError = action.payload
        },

        enableMemberError: (state, action) => {
          state.enableMemberError = action.payload
        },
        disableMemberError: (state, action) => {
          state.disableMemberError = action.payload
        },
        forceOfflineMemberError: (state, action) => {
          state.forceOfflineMemberError = action.payload
        },
        memberStatsError: (state, action) => {
          state.memberStatsError = action.payload
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
  setPermissionsError,

  setIdentityGroupsLoading,
  setIdentityGroups,
  setIdentityGroupsFetch,
  setIdentityGroupsError,

  setEnvironment,
  setEnvironmentError,

  setAssetsLoading,
  setAssets,
  setAssetsFetch,
  setAssetsError,

  setAsset,
  setAssetAddError,
  setAssetModifyError,
  setAssetDeleteError,

  setPartitionsLoading,
  setPartitions,
  setPartitionsFetch,
  setPartitionsError,
  clearPartitions,

  setRouteDomainsLoading,
  setRouteDomains,
  setRouteDomainsFetch,
  setRouteDomainsError,

  setPartition,
  setPartitionAddError,
  setPartitionModifyError,
  setPartitionDeleteError,

  nodesLoading,
  nodes,
  nodesFetch,
  nodesError,
  addNodeError,
  deleteNodeError,

  monitorTypes,
  monitorTypesError,

  monitorsLoading,
  monitors,
  monitorsFetch,
  monitorsError,
  addMonitorError,
  modifyMonitorError,
  deleteMonitorError,

  poolsLoading,
  pools,
  poolsFetch,
  poolsError,
  addPoolError,
  modifyPoolError,
  deletePoolError,

  poolMembersLoading,
  poolMembers,
  poolMembersFetch,
  poolMembersError,
  addPoolMemberError,
  modifyPoolMemberError,
  deletePoolMemberError,

  profilesLoading,
  profiles,
  profilesFetch,
  profilesError,
  addProfileError,
  deleteProfileError,

  setVirtualServersLoading,
  setVirtualServers,
  setVirtualServersFetch,
  virtualServersError,

  setCertificatesLoading,
  setCertificates,
  setCertificatesFetch,
  setCertificatesError,

  setKeysLoading,
  setKeys,
  setKeysFetch,
  setKeysError,

  certificateAddError,
  certificateDeleteError,
  keyAddError,
  keyDeleteError,

  setCreateL4ServiceError,
  setCreateL7ServiceError,
  setDeleteServiceError,

  enableMemberError,
  disableMemberError,
  forceOfflineMemberError,
  memberStatsError,

  resetObjects,
  cleanUp
} = actions

export default reducer
