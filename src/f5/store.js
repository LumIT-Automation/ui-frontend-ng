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

        permissionAddError: ( state, action) => {
          state.permissionAddError = action.payload
        },
        permissionModifyError: ( state, action) => {
          state.permissionModifyError = action.payload
        },
        permissionDeleteError: ( state, action) => {
          state.permissionDeleteError = action.payload
        },

        rolesError: ( state, action) => {
          state.rolesError = action.payload
        },

        newIdentityGroupAddError: ( state, action) => {
          state.newIdentityGroupAddError = action.payload
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
        identityGroupDeleteError: (state, action) => {
          state.identityGroupDeleteError = action.payload
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
        assetAddError: (state, action) => {
          state.assetAddError = action.payload
        },
        assetModifyError: (state, action) => {
          state.assetModifyError = action.payload
        },
        assetDeleteError: (state, action) => {
          state.assetDeleteError = action.payload
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

        partition: (state, action) => {
          state.partition = action.payload
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

        dataGroupsLoading: (state, action) => {
          state.dataGroupsLoading = action.payload
        },
        dataGroups: (state, action) => {
          state.dataGroups = action.payload.data.items
        },
        dataGroupsFetch: (state, action) => {
          state.dataGroupsFetch = action.payload
        },
        dataGroupsError: (state, action) => {
          state.dataGroupsError = action.payload
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

        nodeAddError: (state, action) => {
          state.nodeAddError = action.payload
        },
        nodeDeleteError: (state, action) => {
          state.nodeDeleteError = action.payload
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

        monitorAddError: (state, action) => {
          state.monitorAddError = action.payload
        },
        monitorModifyError: (state, action) => {
          state.monitorModifyError = action.payload
        },
        monitorDeleteError: (state, action) => {
          state.monitorDeleteError = action.payload
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

        poolAddError: (state, action) => {
          state.poolAddError = action.payload
        },
        poolModifyError: (state, action) => {
          state.poolModifyError = action.payload
        },
        poolDeleteError: (state, action) => {
          state.poolDeleteError = action.payload
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

        poolMemberAddError: (state, action) => {
          state.poolMemberAddError = action.payload
        },
        poolMemberModifyError: (state, action) => {
          state.poolMemberModifyError = action.payload
        },
        poolMemberDeleteError: (state, action) => {
          state.poolMemberDeleteError = action.payload
        },
        poolMemberEnableError: (state, action) => {
          state.poolMemberEnableError = action.payload
        },
        poolMemberDisableError: (state, action) => {
          state.poolMemberDisableError = action.payload
        },
        poolMemberForceOfflineError: (state, action) => {
          state.poolMemberForceOfflineError = action.payload
        },
        poolMemberStatsError: (state, action) => {
          state.poolMemberStatsError = action.payload
        },

        snatPoolsLoading: (state, action) => {
          state.snatPoolsLoading = action.payload
        },
        snatPools: (state, action) => {
          state.snatPools = action.payload.data.items
        },
        snatPoolsFetch: (state, action) => {
          state.snatPoolsFetch = action.payload
        },
        snatPoolsError: (state, action) => {
          state.snatPoolsError = action.payload
        },

        snatPoolAddError: (state, action) => {
          state.snatPoolAddError = action.payload
        },
        snatPoolModifyError: (state, action) => {
          state.snatPoolModifyError = action.payload
        },
        snatPoolDeleteError: (state, action) => {
          state.snatPoolDeleteError = action.payload
        },

        irulesLoading: (state, action) => {
          state.irulesLoading = action.payload
        },
        irules: (state, action) => {
          state.irules = action.payload.data.items
        },
        irulesFetch: (state, action) => {
          state.irulesFetch = action.payload
        },
        irulesError: (state, action) => {
          state.irulesError = action.payload
        },

        iruleAddError: (state, action) => {
          state.iruleAddError = action.payload
        },
        iruleModifyError: (state, action) => {
          state.iruleModifyError = action.payload
        },
        iruleDeleteError: (state, action) => {
          state.iruleDeleteError = action.payload
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

        profileAddError: (state, action) => {
          state.profileAddError = action.payload
        },
        profileDeleteError: (state, action) => {
          state.profileDeleteError = action.payload
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

        virtualServerAddError: (state, action) => {
          state.virtualServerAddError = action.payload
        },
        virtualServerModifyError: (state, action) => {
          state.virtualServerModifyError = action.payload
        },
        virtualServerDeleteError: (state, action) => {
          state.virtualServerDeleteError = action.payload
        },

        l4ServiceCreateError: (state, action) => {
          state.l4ServiceCreateError = action.payload
        },
        l7ServiceCreateError: (state, action) => {
          state.l7ServiceCreateError = action.payload
        },
        serviceDeleteError: (state, action) => {
          state.serviceDeleteError = action.payload
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

        configurationModifyError: ( state, action) => {
          state.configurationModifyError = action.payload
        },

        genericError: ( state, action) => {
          state.genericError = action.payload
        },


        resetObjects: (state, action) => {

          state.asset = null
          state.partition = null

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

  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  rolesError,

  identityGroupsLoading,
  identityGroups,
  identityGroupsFetch,
  identityGroupsError,

  identityGroupDeleteError,
  newIdentityGroupAddError,

  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,
  assetAddError,
  assetModifyError,
  assetDeleteError,

  partitionsLoading,
  partitions,
  partitionsFetch,
  partitionsError,

  partition,

  routeDomainsLoading,
  routeDomains,
  routeDomainsFetch,
  routeDomainsError,

  dataGroupsLoading,
  dataGroups,
  dataGroupsFetch,
  dataGroupsError,

  nodesLoading,
  nodes,
  nodesFetch,
  nodesError,

  nodeAddError,
  nodeDeleteError,

  monitorTypes,
  monitorTypesError,

  monitorsLoading,
  monitors,
  monitorsFetch,
  monitorsError,

  monitorAddError,
  monitorModifyError,
  monitorDeleteError,

  poolsLoading,
  pools,
  poolsFetch,
  poolsError,

  poolAddError,
  poolModifyError,
  poolDeleteError,

  poolMembersLoading,
  poolMembers,
  poolMembersFetch,
  poolMembersError,

  poolMemberAddError,
  poolMemberModifyError,
  poolMemberDeleteError,
  poolMemberEnableError,
  poolMemberDisableError,
  poolMemberForceOfflineError,
  poolMemberStatsError,

  snatPoolsLoading,
  snatPools,
  snatPoolsFetch,
  snatPoolsError,

  snatPoolAddError,
  snatPoolModifyError,
  snatPoolDeleteError,

  irulesLoading,
  irules,
  irulesFetch,
  irulesError,

  iruleAddError,
  iruleModifyError,
  iruleDeleteError,

  certificatesLoading,
  certificates,
  certificatesFetch,
  certificatesError,

  certificateAddError,
  certificateModifyError,
  certificateDeleteError,

  keysLoading,
  keys,
  keysFetch,
  keysError,

  keyAddError,
  keyModifyError,
  keyDeleteError,

  profilesLoading,
  profiles,
  profilesFetch,
  profilesError,

  profileAddError,
  profileDeleteError,

  virtualServersLoading,
  virtualServers,
  virtualServersFetch,
  virtualServersError,

  virtualServerAddError,
  virtualServerModifyError,
  virtualServerDeleteError,

  l4ServiceCreateError,
  l7ServiceCreateError,
  serviceDeleteError,

  configurationLoading,
  configuration,
  configurationFetch,
  configurationError,

  configurationModifyError,

  genericError,

  resetObjects,
  cleanUp
} = actions

export default reducer
