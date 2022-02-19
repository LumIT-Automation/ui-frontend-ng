import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const f5Slice = createSlice({
    name: 'f5',
    initialState: {},
    reducers: {
        permissionsLoading: (state, action) => {
          state.permissionsLoading = action.payload
        },
        permissions: (state, action) => {
          state.permissions = action.payload
        },
        permissionsFetch: (state, action) => {
          state.permissionsFetch = action.payload
        },
        permissionsError: (state, action) => {
          state.permissionsError = action.payload
        },

        addPermissionError: ( state, action) => {
          state.addPermissionError = action.payload
        },
        modifyPermissionError: ( state, action) => {
          state.modifyPermissionError = action.payload
        },
        deletePermissionError: ( state, action) => {
          state.deletePermissionError = action.payload
        },

        fetchRolesError: ( state, action) => {
          state.fetchRolesError = action.payload
        },
        addNewDnError: ( state, action) => {
          state.addNewDnError = action.payload
        },

        identityGroupsLoading: (state, action) => {
          state.identityGroupsLoading = action.payload
        },
        identityGroups: (state, action) => {
          state.identityGroups = action.payload.data.items
        },
        identityGroupsFetch: (state, action) => {
          state.identityGroupsFetch = action.payload
        },
        identityGroupsError: (state, action) => {
          state.identityGroupsError = action.payload
        },

        environment: (state, action) => {
          state.environment = action.payload
        },
        environmentError: (state, action) => {
          state.environmentError = action.payload
        },

        assetsLoading: (state, action) => {
          state.assetsLoading = action.payload
        },
        assets: (state, action) => {
          state.assets = action.payload.data.items
        },
        assetsFetch: (state, action) => {
          state.assetsFetch = action.payload
        },
        assetsError: (state, action) => {
          state.assetsError = action.payload
        },

        asset: (state, action) => {
          state.asset = action.payload
        },
        addAssetError: (state, action) => {
          state.addAssetError = action.payload
        },
        modifyAssetError: (state, action) => {
          state.modifyAssetError = action.payload
        },
        deleteAssetError: (state, action) => {
          state.deleteAssetError = action.payload
        },

        partitionsLoading: (state, action) => {
          state.partitionsLoading = action.payload
        },
        partitions: (state, action) => {
          state.partitions = action.payload.data.items
        },
        partitionsFetch: (state, action) => {
          state.partitionsFetch = action.payload
        },
        partitionsError: (state, action) => {
          state.partitionsError = action.payload
        },
        clearPartitions: (state, action) => {
          state.partitions = null
        },

        partition: (state, action) => {
          state.partition = action.payload
        },
        partitionAddError: (state, action) => {
          state.partitionAddError = action.payload
        },
        partitionModifyError: (state, action) => {
          state.partitionModifyError = action.payload
        },
        partitionDeleteError: (state, action) => {
          state.partitionDeleteError = action.payload
        },

        routeDomainsLoading: (state, action) => {
          state.routeDomainsLoading = action.payload
        },
        routeDomains: (state, action) => {
          state.routeDomains = action.payload.data.items
        },
        routeDomainsFetch: (state, action) => {
          state.routeDomainsFetch = action.payload
        },
        routeDomainsError: (state, action) => {
          state.routeDomainsError = action.payload
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



        virtualServersLoading: (state, action) => {
          state.virtualServersLoading = action.payload
        },
        virtualServers: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        virtualServersFetch: (state, action) => {
          state.virtualServersFetch = action.payload
        },
        virtualServersError: (state, action) => {
          state.virtualServersError = action.payload
        },


        certificatesLoading: (state, action) => {
          state.certificatesLoading = action.payload
        },
        certificates: (state, action) => {
          state.certificates = action.payload.data.items
        },
        certificatesFetch: (state, action) => {
          state.certificatesFetch = action.payload
        },
        certificatesError: (state, action) => {
          state.certificatesError = action.payload
        },

        keysLoading: (state, action) => {
          state.keysLoading = action.payload
        },
        keys: (state, action) => {
          state.keys = action.payload.data.items
        },
        keysFetch: (state, action) => {
          state.keysFetch = action.payload
        },
        keysError: (state, action) => {
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

        createL4ServiceError: (state, action) => {
          state.createL4ServiceError = action.payload
        },
        createL7ServiceError: (state, action) => {
          state.createL7ServiceError = action.payload
        },
        deleteServiceError: (state, action) => {
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

        historysLoading: ( state, action) => {
          state.historysLoading = action.payload
        },
        historys: ( state, action) => {
          state.historys = action.payload.data.items
        },
        historysFetch: ( state, action) => {
          state.historysFetch = action.payload
        },
        historysError: ( state, action) => {
          state.historysError = action.payload
        },

        configurationLoading: ( state, action) => {
          state.configurationLoading = action.payload
        },
        configuration: ( state, action) => {
          state.configuration = action.payload
        },
        configurationFetch: ( state, action) => {
          state.configurationFetch = action.payload
        },
        configurationError: ( state, action) => {
          state.configurationError = action.payload
        },

        genericError: ( state, action) => {
          state.genericError = action.payload
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
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  addPermissionError,
  modifyPermissionError,
  deletePermissionError,

  fetchRolesError,
  addNewDnError,

  identityGroupsLoading,
  identityGroups,
  identityGroupsFetch,
  identityGroupsError,

  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,
  addAssetError,
  modifyAssetError,
  deleteAssetError,

  partitionsLoading,
  partitions,
  partitionsFetch,
  partitionsError,
  clearPartitions,

  routeDomainsLoading,
  routeDomains,
  routeDomainsFetch,
  routeDomainsError,

  partition,
  partitionAddError,
  partitionModifyError,
  partitionDeleteError,

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

  virtualServersLoading,
  virtualServers,
  virtualServersFetch,
  virtualServersError,

  certificatesLoading,
  certificates,
  certificatesFetch,
  certificatesError,

  keysLoading,
  keys,
  keysFetch,
  keysError,

  certificateAddError,
  certificateDeleteError,
  keyAddError,
  keyDeleteError,

  createL4ServiceError,
  createL7ServiceError,
  deleteServiceError,

  enableMemberError,
  disableMemberError,
  forceOfflineMemberError,
  memberStatsError,

  historysLoading,
  historys,
  historysFetch,
  historysError,

  configurationLoading,
  configuration,
  configurationFetch,
  configurationError,

  genericError,

  resetObjects,
  cleanUp
} = actions

export default reducer
