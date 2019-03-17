import { generateActions, createActionTypes } from 'redux-generate'

const TypeViewSettings = [
  'TOGGLE_PAGE',
  'TOGGLE_LIVE_MODE',
  'TOGGLE_LAYOUT_MODE',
  'TOGGLE_COMPACT_MODE',
  'TOGGLE_SETTINGS_MODE',
  'TOGGLE_MIDI_LEARN_MODE',
  'TOGGLE_SETTINGS_DIALOG_MODE',
  'TOGGLE_AUTO_ARRANGE_MODE',
  'CHANGE_THEME',
  'UPDATE_VIEW_SETTINGS',
  'DELETE_PAGE_FROM_FOOTER',
  'DELETE_FOOTER_PAGES',
  'SWAP_FOOTER_PAGES',
  'CHANGE_FOOTER_PAGE',
  'SET_AVAILABLE_DRIVERS',
  'SET_FOOTER_BUTTON_FOCUS',
  'SET_LAST_FOCUSED_INDEX',
  'SET_COLUMNS',
  'SET_ROW_HEIGHT',
  'TOGGLE_AUTOSIZE',
  'SET_X_MARGIN',
  'SET_Y_MARGIN',
  'SET_X_PADDING',
  'SET_Y_PADDING',
  'SET_FULLSCREEN_ON_LIVEMODE'
]

export const ActionTypeViewSettings = createActionTypes(TypeViewSettings)

export const Actions = {...generateActions(ActionTypeViewSettings)}
