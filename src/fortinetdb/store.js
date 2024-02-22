import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const fortinetdbSlice = createSlice({
    name: 'fortinetdb',
    initialState: {},
    reducers: {

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

      accountsLoading: (state, action) => {
        state.accountsLoading = action.payload
      },
      accounts: (state, action) => {
        state.accounts = action.payload.data.items
      },
      accountsFetch: (state, action) => {
        state.accountsFetch = action.payload
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

      ddossesLoading: (state, action) => {
        state.ddossesLoading = action.payload
      },
      ddosses: (state, action) => {
        state.ddosses = action.payload.data.items
      },
      ddossesFetch: (state, action) => {
        state.ddossesFetch = action.payload
      },

      project: (state, action) => {
        state.project = action.payload
      },

      account: (state, action) => {
        state.account = action.payload
      },

      device: (state, action) => {
        state.device = action.payload
      },

      ddos: (state, action) => {
        state.ddos = action.payload
      },

      field: (state, action) => {
        state.field = action.payload.data.items
      },
      value: (state, action) => {
        state.value = action.payload.data.items
      },

      categoriasLoading: (state, action) => {
        state.categoriasLoading = action.payload
      },
      categorias: (state, action) => {
        state.categorias = action.payload
      },
      categoria: (state, action) => {
        state.categoria = action.payload
      },

      vendorsLoading: (state, action) => {
        state.vendorsLoading = action.payload
      },
      vendors: (state, action) => {
        state.vendors = action.payload
      },
      vendor: (state, action) => {
        state.vendor = action.payload
      },

      modellosLoading: (state, action) => {
        state.modellosLoading = action.payload
      },
      modellos: (state, action) => {
        state.modellos = action.payload
      },
      modellos20Loading: (state, action) => {
        state.modellos20Loading = action.payload
      },
      modellos20: (state, action) => {
        state.modellos20 = action.payload
      },
      modello: (state, action) => {
        state.modello = action.payload
      },

      firmwaresLoading: (state, action) => {
        state.firmwaresLoading = action.payload
      },
      firmwares: (state, action) => {
        state.firmwares = action.payload
      },
      firmware: (state, action) => {
        state.firmware = action.payload
      },

      backupStatussLoading: (state, action) => {
        state.backupStatussLoading = action.payload
      },
      backupStatuss: (state, action) => {
        state.backupStatuss = action.payload
      },
      backupStatus: (state, action) => {
        state.backupStatus = action.payload
      },

      regionesLoading: (state, action) => {
        state.regionesLoading = action.payload
      },
      regiones: (state, action) => {
        state.regiones = action.payload
      },
      regione: (state, action) => {
        state.regione = action.payload
      },

      attivazioneAnnosLoading: (state, action) => {
        state.attivazioneAnnosLoading = action.payload
      },
      attivazioneAnnos: (state, action) => {
        state.attivazioneAnnos = action.payload
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

      eolAnnosLoading: (state, action) => {
        state.eolAnnosLoading = action.payload
      },
      eolAnnos: (state, action) => {
        state.eolAnnos = action.payload
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

      serviziosLoading: (state, action) => {
        state.serviziosLoading = action.payload
      },
      servizios: (state, action) => {
        state.servizios = action.payload
      },
      servizio: (state, action) => {
        state.servizio = action.payload
      },
      servizioLoading: (state, action) => {
        state.servizioLoading = action.payload
      },

      ragioneSocialesLoading: (state, action) => {
        state.ragioneSocialesLoading = action.payload
      },
      ragioneSociales: (state, action) => {
        state.ragioneSociales = action.payload
      },
      ragioneSociale: (state, action) => {
        state.ragioneSociale = action.payload
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
  projectsLoading,
  projects,
  projectsFetch,

  accountsLoading,
  accounts,
  accountsFetch,

  devicesLoading,
  devices,
  devicesFetch,

  ddossesLoading,
  ddosses,
  ddossesFetch,

  project,
  account,
  device,
  ddos,
  field,
  value,

  categorias,
  categoriasLoading,
  categoria,

  vendors,
  vendorsLoading,
  vendor,

  modellos,
  modellosLoading,
  modellos20,
  modellos20Loading,
  modello,

  firmwares,
  firmwaresLoading,
  firmware,

  backupStatuss,
  backupStatussLoading,
  backupStatus,

  regiones,
  regionesLoading,
  regione,

  attivazioneAnnos,
  attivazioneAnnosLoading,
  attivazioneAnno,

  attivazioneMeses,
  attivazioneMesesLoading,

  eolAnnos,
  eolAnnosLoading,

  eolAnno,

  eolMeses,
  eolMesesLoading,

  servizios,
  serviziosLoading,
  servizio,
  servizioLoading,

  ragioneSociales,
  ragioneSocialesLoading,
  ragioneSociale,

  cleanUp
} = actions

export default reducer
