import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const fortinetdbSlice = createSlice({
    name: 'fortinetdb',
    initialState: {},
    reducers: {

      permissionsLoading: (state, action) => {
        state.permissionsLoading = action.payload
      },
      permissions: (state, action) => {
        state.permissions = action.payload.data.items
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


      projectsLoading: (state, action) => {
        state.projectsLoading = action.payload
      },
      projects: (state, action) => {
        state.projects = action.payload.data.items
        state.totalUniqueProjects = action.payload.data.totalUniqueProjects
      },

      projectsFetch: (state, action) => {
        state.projectsFetch = action.payload
      },
      projectsError: (state, action) => {
        state.projectsError = action.payload
      },

      accountsLoading: (state, action) => {
        state.accountsLoading = action.payload
      },
      accounts: (state, action) => {
        state.accounts = action.payload.data.items
      },
      accountsFetch: (state, action) => {
        state.accountsFetch = action.payload
      },
      accountsError: (state, action) => {
        state.accountsError = action.payload
      },

      devicesLoading: (state, action) => {
        state.devicesLoading = action.payload
      },
      devices: (state, action) => {
        state.devices = action.payload.data.items
      },
      devicesFetch: (state, action) => {
        state.devicesFetch = action.payload
      },
      devicesError: (state, action) => {
        state.devicesError = action.payload
      },

      ddossesLoading: (state, action) => {
        state.ddossesLoading = action.payload
      },
      ddosses: (state, action) => {
        state.ddosses = action.payload.data.items
      },
      ddossesFetch: (state, action) => {
        state.ddossesFetch = action.payload
      },
      ddossesError: (state, action) => {
        state.ddossesError = action.payload
      },


      project: (state, action) => {
        state.project = action.payload
      },
      projectError: (state, action) => {
        state.projectError = action.payload
      },

      account: (state, action) => {
        state.account = action.payload
      },
      accountError: (state, action) => {
        state.accountError = action.payload
      },

      device: (state, action) => {
        state.device = action.payload
      },
      deviceError: (state, action) => {
        state.deviceError = action.payload
      },

      ddos: (state, action) => {
        state.ddos = action.payload
      },
      ddosError: (state, action) => {
        state.ddosError = action.payload
      },

      field: (state, action) => {
        state.field = action.payload.data.items
      },
      fieldError: (state, action) => {
        state.fieldError = action.payload
      },
      value: (state, action) => {
        state.value = action.payload.data.items
      },
      valueError: (state, action) => {
        state.valueError = action.payload
      },



      categoriasLoading: (state, action) => {
        state.categoriasLoading = action.payload
      },
      categorias: (state, action) => {
        state.categorias = action.payload
      },
      categoriasError: (state, action) => {
        state.categoriasError = action.payload
      },
      categoria: (state, action) => {
        state.categoria = action.payload
      },
      categoriaError: (state, action) => {
        state.categoriaError = action.payload
      },



      vendorsLoading: (state, action) => {
        state.vendorsLoading = action.payload
      },
      vendors: (state, action) => {
        state.vendors = action.payload
      },
      vendorsError: (state, action) => {
        state.vendorsError = action.payload
      },
      vendor: (state, action) => {
        state.vendor = action.payload
      },
      vendorError: (state, action) => {
        state.modelloError = action.payload
      },

      modellosLoading: (state, action) => {
        state.modellosLoading = action.payload
      },
      modellos: (state, action) => {
        state.modellos = action.payload
      },
      modellosError: (state, action) => {
        state.modellosError = action.payload
      },
      modellos20Loading: (state, action) => {
        state.modellos20Loading = action.payload
      },
      modellos20: (state, action) => {
        state.modellos20 = action.payload
      },
      modellos20Error: (state, action) => {
        state.modellos20Error = action.payload
      },
      modello: (state, action) => {
        state.modello = action.payload
      },
      modelloError: (state, action) => {
        state.modelloError = action.payload
      },

      firmwaresLoading: (state, action) => {
        state.firmwaresLoading = action.payload
      },
      firmwares: (state, action) => {
        state.firmwares = action.payload
      },
      firmwaresError: (state, action) => {
        state.firmwaresError = action.payload
      },
      firmware: (state, action) => {
        state.firmware = action.payload
      },
      firmwareError: (state, action) => {
        state.firmwareError = action.payload
      },

      backupStatussLoading: (state, action) => {
        state.backupStatussLoading = action.payload
      },
      backupStatuss: (state, action) => {
        state.backupStatuss = action.payload
      },
      backupStatussError: (state, action) => {
        state.backupStatussError = action.payload
      },
      backupStatus: (state, action) => {
        state.backupStatus = action.payload
      },
      backupStatusError: (state, action) => {
        state.backupStatusError = action.payload
      },

      regionesLoading: (state, action) => {
        state.regionesLoading = action.payload
      },
      regiones: (state, action) => {
        state.regiones = action.payload
      },
      regionesError: (state, action) => {
        state.regionesError = action.payload
      },
      regione: (state, action) => {
        state.regione = action.payload
      },
      regioneError: (state, action) => {
        state.regioneError = action.payload
      },

      attivazioneAnnosLoading: (state, action) => {
        state.attivazioneAnnosLoading = action.payload
      },
      attivazioneAnnos: (state, action) => {
        state.attivazioneAnnos = action.payload
      },
      attivazioneAnnosError: (state, action) => {
        state.attivazioneAnnosError = action.payload
      },
      attivazioneAnno: (state, action) => {
        state.attivazioneAnno = action.payload
      },

      attivazioneMesesLoading: (state, action) => {
        state.attivazioneMesesLoading = action.payload
      },
      attivazioneMeses: (state, action) => {
        state.attivazioneMeses = action.payload
      },
      attivazioneMesesError: (state, action) => {
        state.attivazioneMesesError = action.payload
      },


      eolAnnosLoading: (state, action) => {
        state.eolAnnosLoading = action.payload
      },
      eolAnnos: (state, action) => {
        state.eolAnnos = action.payload
      },
      eolAnnosError: (state, action) => {
        state.eolAnnosError = action.payload
      },
      eolAnno: (state, action) => {
        state.eolAnno = action.payload
      },

      eolMesesLoading: (state, action) => {
        state.eolMesesLoading = action.payload
      },
      eolMeses: (state, action) => {
        state.eolMeses = action.payload
      },
      eolMesesError: (state, action) => {
        state.eolMesesError = action.payload
      },

      serviziosLoading: (state, action) => {
        state.serviziosLoading = action.payload
      },
      servizios: (state, action) => {
        state.servizios = action.payload
      },
      serviziosError: (state, action) => {
        state.serviziosError = action.payload
      },
      servizio: (state, action) => {
        state.servizio = action.payload
      },
      servizioLoading: (state, action) => {
        state.servizioLoading = action.payload
      },
      servizioError: (state, action) => {
        state.servizioError = action.payload
      },

      ragioneSocialesLoading: (state, action) => {
        state.ragioneSocialesLoading = action.payload
      },
      ragioneSociales: (state, action) => {
        state.ragioneSociales = action.payload
      },
      ragioneSocialesError: (state, action) => {
        state.ragioneSocialesError = action.payload
      },
      ragioneSociale: (state, action) => {
        state.ragioneSociale = action.payload
      },
      ragioneSocialeError: (state, action) => {
        state.ragioneSocialeError = action.payload
      },

      genericError: (state, action) => {
        state.genericError = action.payload
      },


      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = fortinetdbSlice;

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

  projectsLoading,
  projects,
  projectsFetch,
  projectsError,

  accountsLoading,
  accounts,
  accountsFetch,
  accountsError,

  devicesLoading,
  devices,
  devicesFetch,
  devicesError,

  ddossesLoading,
  ddosses,
  ddossesFetch,
  ddossesError,


  project,
  projectError,

  account,
  accountError,

  device,
  deviceError,

  ddos,
  ddosError,

  field,
  fieldError,

  value,
  valueError,

  categorias,
  categoriasLoading,
  categoriasError,
  categoria,
  categoriaError,

  vendors,
  vendorsLoading,
  vendorsError,
  vendor,
  vendorError,

  modellos,
  modellosLoading,
  modellosError,
  modellos20,
  modellos20Loading,
  modellos20Error,
  modello,
  modelloError,

  firmwares,
  firmwaresLoading,
  firmwaresError,
  firmware,
  firmwareError,

  backupStatuss,
  backupStatussLoading,
  backupStatussError,
  backupStatus,
  backupStatusError,

  regiones,
  regionesLoading,
  regionesError,
  regione,
  regioneError,

  attivazioneAnnos,
  attivazioneAnnosLoading,
  attivazioneAnnosError,

  attivazioneAnno,

  attivazioneMeses,
  attivazioneMesesLoading,
  attivazioneMesesError,

  eolAnnos,
  eolAnnosLoading,
  eolAnnosError,

  eolAnno,

  eolMeses,
  eolMesesLoading,
  eolMesesError,

  servizios,
  serviziosLoading,
  serviziosError,
  servizio,
  servizioLoading,
  servizioError,

  ragioneSociales,
  ragioneSocialesLoading,
  ragioneSocialesError,
  ragioneSociale,
  ragioneSocialeError,

  genericError,

  cleanUp
} = actions

export default reducer
