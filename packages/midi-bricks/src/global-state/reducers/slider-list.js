import WebMIDI from 'webmidi'

import { ActionTypeSliderList } from '../actions/slider-list'
import { midi } from 'tonal'
import { fromMidi } from '../../utils/fromMidi'
import { map } from 'lodash'
import { getUniqueId } from '../../utils/get-unique-id'
import { createNextState } from '@reduxjs/toolkit'

export const initId = `page-${getUniqueId()}`

export const STRIP_TYPE = {
  BUTTON: 'BUTTON',
  BUTTON_TOGGLE: 'BUTTON_TOGGLE',
  BUTTON_CC: 'BUTTON_CC',
  BUTTON_TOGGLE_CC: 'BUTTON_TOGGLE_CC',
  BUTTON_PROGRAM_CHANGE: 'BUTTON_PROGRAM_CHANGE',
  SLIDER: 'SLIDER',
  SLIDER_HORZ: 'SLIDER_HORZ',
  LABEL: 'LABEL',
  PAGE: 'PAGE',
  XYPAD: 'XYPAD'
}

const {
  BUTTON,
  BUTTON_CC,
  BUTTON_TOGGLE,
  BUTTON_TOGGLE_CC,
  BUTTON_PROGRAM_CHANGE,
  SLIDER,
  SLIDER_HORZ,
  LABEL,
  PAGE,
  XYPAD
} = STRIP_TYPE

export const sliders = {
  [ActionTypeSliderList.INIT_MIDI_ACCESS_PENDING](state) {
    return createNextState(state, () => {
      return state
    })
  },

  [ActionTypeSliderList.INIT_FAILED](state) {
    return createNextState(state, (draftState) => {
      draftState.midi = {
        midiAccess: {
          inputs: {},
          outputs: {}
        }
      }
      draftState.isMidiFailed = true
      return draftState
    })
  },

  [ActionTypeSliderList.INIT_MIDI_ACCESS_OK](state, action) {
    return createNextState(state, (draftState) => {
      draftState.midi = action.payload
      draftState.isMidiFailed = false
      return draftState
    })
  },

  [ActionTypeSliderList.ADD_MIDI_ELEMENT](state, action) {
    const { isMidiFailed, sliderList, midi: tmpMidi } = transformAddState(state, action)
    return createNextState(state, (draftState) => {
      draftState.sliderList = sliderList
      draftState.isMidiFailed = isMidiFailed
      draftState.midi = tmpMidi
      return draftState
    })
  },

  [ActionTypeSliderList.CLONE](state, action) {
    const i = (action.payload && action.payload.i) || ''
    let tmpState = null
    const list = state.sliderList
    let idx = state.sliderList.length - 1
    state.sliderList.forEach((item, id) => {
      if (item.i === i) {
        tmpState = {
          ...item,
          x: state.length + 1
        }
        idx = id
      }
    })

    const newArr = Object.values(Object.assign({}, list))
    const calcCC =
      i &&
      parseInt(
        tmpState.midiCC && (tmpState.midiCC || tmpState.midiCC[0] || 60),
        10
      ) + 1
    const caclCCThresh = calcCC > 127 ? 60 : calcCC
    const newDate = getUniqueId()
    let x = 0
    let y = 0
    let lastItem = { x: 0, y: 0 }
    state.sliderList.forEach((item) => {
      if (item.x > lastItem.x) x = item.x
      if (item.y > lastItem.y) y = item.y
      lastItem = item
    })
    let newEntry = i
      ? {
        ...tmpState,
        label: tmpState.label,
        i: newDate,
        midiCC: [caclCCThresh],
        x: x + 1,
        y: y + 1
      }
      : {
        ...list[idx],
        label: list[idx].label,
        i: newDate,
        midiCC: [caclCCThresh || 60],
        x: x + 1,
        y: y + 1
      }

    newArr.splice(idx, 0, newEntry)

    // Check for duplicated ids, or Error
    newArr.forEach((tmpItem, id) => {
      newArr.forEach((item, ii) => {
        if (tmpItem.i === item.i && id !== ii) {
          throw new Error(
            'Duplicated ID found in store. Look after better creation of unique ids, man!'
          )
        }
      })
    })
    return updatePagesWithSliderlist(
      state,
      newArr
    )
  },
  [ActionTypeSliderList.CHANGE_BUTTON_TYPE](state, action) {
    const { i, val } = action.payload
    return createNextState(state, (draftState) => {
      const idx = state.sliderList.findIndex((item) => item.i === i)
      draftState.sliderList[idx].type = val
      return draftState
    })
  },
  [ActionTypeSliderList.DELETE](state, action) {
    const { i: sentIdx } = action.payload
    const isPage = sentIdx.toString().startsWith('page')

    if (isPage) {
      return createNextState(state, (draftState) => {
        let sliderList = []

        draftState.sliderList = sliderList
        return draftState
      })
    } else {
      return createNextState(state, (draftState) => {
        const sliderList = state.sliderList.filter(
          ({ i }) => sentIdx && sentIdx.toString() !== i
        )

        draftState.sliderList = sliderList
        return draftState
      })
    }
  },
  [ActionTypeSliderList.DELETE_ALL](state) {
    return createNextState(state, (draftState) => {
      draftState.sliderList = []
      draftState.presetName = ''
      return draftState
    })
  },

  [ActionTypeSliderList.HANDLE_SLIDER_CHANGE]({ sliderList }, action) {
    // At first send MIDI
    const { i, val } = action.payload
    const idx = sliderList.findIndex((item) => item.i === i)
    const { midiCC, midiChannel, driverName, label, isNoteOn, type } =
      sliderList[idx] || {}
    sendControlChanges({ midiCC, midiChannel, driverName, val, label })

    // Now, do view state changes
    return createNextState({ sliderList }, (draftState) => {
      // For CC Buttons we toggle the NoteOn state at each trigger
      // Keep in mind, that the component button will take care of sending the right values for itself.
      if ([BUTTON_CC, BUTTON_TOGGLE_CC].includes(type)) {
        draftState.sliderList[idx].isNoteOn = !isNoteOn
      }
      draftState.sliderList[idx].val = val
      return draftState
    })
  },

  [ActionTypeSliderList.SEND_MIDI_CC_Y](state, action) {
    const { idx, yVal } = action.payload
    let newStateTmp = state.sliderList

    // Handle multi CC
    const tmp = newStateTmp[idx]
    const { yMidiCc, yMidiChannel, yDriverName, label } = tmp
    sendControlChanges({
      midiCC: yMidiCc,
      midiChannel: yMidiChannel,
      driverName: yDriverName,
      val: yVal,
      label
    })
    return createNextState(state, (draftState) => {
      const idxx = state.sliderList.findIndex((er) => er.i === idx)
      draftState.sliderList[idxx].yVal = yVal
      return draftState
    })
  },

  [ActionTypeSliderList.TOGGLE_NOTE](state, action) {
    const { i } = action.payload

    const {
      onVal = 127,
      offVal = 0,
      midiCC,
      midiChannel,
      driverName,
      isNoteOn,
      label
    } = state.sliderList.find((e) => e.i === i) || {}

    toggleNotes({
      onVal,
      offVal,
      midiCC,
      midiChannel,
      driverName,
      isNoteOn,
      label
    })
    const sliderList = toggleNotesInState(state.sliderList, i)
    return updatePagesWithSliderlist(state, sliderList )
  },

  [ActionTypeSliderList.SEND_PROGRAM_CHANGE](state, action) {
    const { i } = action.payload
    const tmp = state.sliderList.find((item) => item.i === i)
    const { midiCC, midiChannel, driverName } = tmp

    const output = getCheckedMidiOut(driverName)
    output && output.sendProgramChange(midiCC[0] - 1, midiChannel)
    return state
  },

  [ActionTypeSliderList.CHANGE_LABEL](state, action) {
    const { i, val } = action.payload
    return createNextState(state, (draftState) => {
      const idx = state.sliderList.findIndex((er) => er.i === i)
      const entry = state.sliderList.find((er) => er.i === i)
      if (entry) {
        draftState.sliderList[idx] = { ...entry, label: val }
      }
      return draftState
    })
  },
  [ActionTypeSliderList.SELECT_MIDI_DRIVER](state, action) {
    const { i, driverName } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].driverName = driverName
      return draftState
    })
  },

  [ActionTypeSliderList.SELECT_MIDI_DRIVER_INPUT](state, action) {
    const { i, driverNameInput } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].driverNameInput = driverNameInput
      return draftState
    })
  },

  [ActionTypeSliderList.SELECT_CC](state, action) {
    const { i, val } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)
    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].midiCC = val
      return draftState
    })
  },
  [ActionTypeSliderList.ADD_MIDI_CC_LISTENER](state, action) {
    const { i, val } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].listenToCc = val
      return draftState
    })
  },
  [ActionTypeSliderList.SET_MAX_VAL](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].maxVal = scaleToMinMax(val, 1, 127)
      return draftState
    })
  },

  [ActionTypeSliderList.SET_MIN_VAL](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].minVal = scaleToMinMax(val, 0, 127)
      return draftState
    })
  },

  [ActionTypeSliderList.SET_ON_VAL](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].onVal = scaleToMinMax(val, 0, 127)
      return draftState
    })
  },

  [ActionTypeSliderList.SET_OFF_VAL](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].offVal = scaleToMinMax(val, 0, 127)
      return draftState
    })
  },

  [ActionTypeSliderList.SELECT_MIDI_CHANNEL](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => item.i === i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].midiChannel = val
      return draftState
    })
  },

  [ActionTypeSliderList.SELECT_MIDI_CHANNEL_INPUT](state, action) {
    const { val, i } = action.payload
    const idx = state.sliderList.findIndex((item) => item.i === i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].midiChannelInput = val
      return draftState
    })
  },

  [ActionTypeSliderList.SAVE_FILE](state, action) {
    // This is actuall only envolved in web app mode, not in electron mode
    const { viewSettings, sliders: tmpSliders, version, pages: pgs } = action.payload

    // Clean out older preset fields
    let pages = Object.values(pgs).reduce(
      (acc, item) => {
        return {
          ...acc,
          [item.id]: {
            ...item,
            midi: undefined
          }
        }
      },
      { ...pgs }
    )

    const tmpFilterStore = {
      version,
      pages,
      viewSettings,
      sliders: tmpSliders
    }
    const content = JSON.stringify(tmpFilterStore)
    const fileName = 'midi-bricks-preset.json'
    const contentType = 'application/json'
    let a = document.createElement('a')
    const file = new window.Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
    return state
  },
  [ActionTypeSliderList.LOAD_FILE](state, action) {
    // DEPRECATD??
    return createNextState(state, (draftState) => {
      const {
        payload: { content: { sliders: { sliderList } } = {} } = {}
      } = action

      draftState.sliderList = sliderList
      return draftState
    })
  },
  [ActionTypeSliderList.CHANGE_LIST_ORDER](state, action) {
    return createNextState(state, (draftState) => {
      const { listOrder } = action.payload

      const sliderList =
        state.sliderList.map((item, idx) => ({
          ...item,
          ...listOrder[idx.toString()]
        })) || []

      draftState.sliderList = sliderList
      return draftState
    })
  },

  [ActionTypeSliderList.MIDI_MESSAGE_ARRIVED](state, action) {
    const { val, cC, channel, driver, isNoteOn } = action.payload

    const sliderList = map(state.sliderList, (item) => {
      const { listenToCc, midiChannelInput, driverNameInput } = item
      if (listenToCc && listenToCc.length > 0) {
        const haveChannelsMatched =
          midiChannelInput === 'all' ||
          channel.toString() === midiChannelInput.toString()
        const hasCc = cC && listenToCc.includes(cC.toString())
        if (hasCc && haveChannelsMatched && driverNameInput === driver) {
          return { ...item, val, isNoteOn }
        } else {
          return { ...item }
        }
      }
      return { ...item }
    })

    return createNextState(state, (draftState) => {
      draftState.sliderList = sliderList
      draftState.monitorVal = { val, cC, channel, driver, isNoteOn }
      return draftState
    })
  },

  [ActionTypeSliderList.CHANGE_COLORS](state, action) {
    const { i, ...rest } = action.payload
    return createNextState(state, (draftState) => {
      const idx = state.sliderList.findIndex((item) => item.i === i)
      draftState.sliderList[idx].colors = {
        ...state.sliderList[idx].colors,
        ...rest
      }
      return draftState
    })
  },

  [ActionTypeSliderList.CHANGE_FONT_SIZE](state, action) {
    const { i, fontSize } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].fontSize = fontSize
      return draftState
    })
  },

  [ActionTypeSliderList.CHANGE_FONT_WEIGHT](state, action) {
    const { i, fontWeight } = action.payload

    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].fontWeight = fontWeight
      return draftState
    })
  },

  [ActionTypeSliderList.CHANGE_XYPAD_SETTINGS](state, action) {
    const {
      i,
      yDriverName,
      yMidiChannel,
      yMaxVal,
      yMinVal,
      yMidiCc
    } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)
    return createNextState(state, (draftState) => {
      if (yMidiChannel) {
        draftState.sliderList[idx].yMidiChannel = yMidiChannel
      }
      if (yDriverName) {
        draftState.sliderList[idx].yDriverName = yDriverName
      }

      if (yMidiCc && yMidiCc.length > 0) {
        draftState.sliderList[idx].yMidiCc = yMidiCc
      }

      if (yMaxVal) {
        draftState.sliderList[idx].yMaxVal = yMaxVal
      }
      if (yMinVal) {
        draftState.sliderList[idx].yMinVal = yMinVal
      }
      return draftState
    })
  },

  [ActionTypeSliderList.TOGGLE_HIDE_VALUE](state, action) {
    const { i } = action.payload
    const idx = state.sliderList.findIndex((item) => i === item.i)

    return createNextState(state, (draftState) => {
      draftState.sliderList[idx].isValueHidden = !state.sliderList[idx].isValueHidden || false
      return draftState
    })
  },

  [ActionTypeSliderList.TRIGGER_ALL_MIDI_ELEMENTS](state) {
    state.sliderList.forEach((item) => {
      const {
        type,
        midiCC,
        midiChannel,
        driverName,
        val,
        onVal,
        offVal,
        isNoteOn,
        label
      } = item
      if ([SLIDER].includes(type)) {
        sendControlChanges({ midiCC, midiChannel, driverName, val, label })
      }
      switch (type) {
        case BUTTON:
          toggleNotes({
            onVal,
            offVal,
            midiCC,
            midiChannel,
            driverName,
            isNoteOn: false,
            label
          })
          toggleNotes({
            onVal,
            offVal,
            midiCC,
            midiChannel,
            driverName,
            isNoteOn: true,
            label
          })
          break

        case BUTTON_CC:
          sendControlChanges({
            midiCC,
            midiChannel,
            driverName,
            val: onVal,
            label
          })
          sendControlChanges({
            midiCC,
            midiChannel,
            driverName,
            val: offVal,
            label
          })
          break

        case BUTTON_TOGGLE:
          toggleNotes({
            onVal,
            offVal,
            midiCC,
            midiChannel,
            driverName,
            isNoteOn: isNoteOn,
            label
          })
          toggleNotes({
            onVal,
            offVal,
            midiCC,
            midiChannel,
            driverName,
            isNoteOn: !isNoteOn,
            label
          })
          break

        case BUTTON_TOGGLE_CC:
          if (isNoteOn) {
            sendControlChanges({
              midiCC,
              midiChannel,
              driverName,
              val: offVal,
              label
            })
            sendControlChanges({
              midiCC,
              midiChannel,
              driverName,
              val: onVal,
              label
            })
          } else {
            sendControlChanges({
              midiCC,
              midiChannel,
              driverName,
              val: onVal,
              label
            })
            sendControlChanges({
              midiCC,
              midiChannel,
              driverName,
              val: offVal,
              label
            })
          }
          break
        default:
      }
    })
    return state
  },

  [ActionTypeSliderList.RESET_VALUES](state) {
    return createNextState(state, (draftState) => {
      return draftState
    })
  },

  [ActionTypeSliderList.SET_MIDI_PAGE](state, action) {
    return createNextState(state, (draftState) => {
      const { sliderList } = action.payload
      draftState.sliderList = sliderList
      return draftState
    })
  }
}

function transformAddState(state, action) {
  const { id, type } = action.payload
  const oldSliderList = state.sliderList || []

  const lastSelectedDriverName =
    (oldSliderList.length > 0 &&
      oldSliderList[oldSliderList.length - 1].driverName) ||
    'None'
  const newDriverName =
    lastSelectedDriverName !== 'None' && lastSelectedDriverName

  const addStateLength = () => oldSliderList.length + 1
  const addMidiCCVal = () => 59 + addStateLength() > 119 && 119

  let midiCC = null
  let label = ''
  let yVal = undefined
  let yDriverName = undefined
  let yMidiCc = undefined
  let yMidiChannel = undefined
  let yMinVal = undefined
  let yMaxVal = undefined

  if ([BUTTON, BUTTON_TOGGLE].includes(type)) {
    label = 'Button ' + addStateLength()
    midiCC = [fromMidi(addMidiCCVal() + 1)]
  }
  if ([BUTTON_CC, BUTTON_TOGGLE_CC, BUTTON_PROGRAM_CHANGE].includes(type)) {
    label = 'CC Button ' + addStateLength()
    midiCC = [addMidiCCVal()]
  }
  if ([SLIDER, SLIDER_HORZ].includes(type)) {
    label = 'Slider ' + addStateLength()
    midiCC = [addMidiCCVal()]
  }
  if ([BUTTON_PROGRAM_CHANGE].includes(type)) {
    label = 'Program Change' + addStateLength()
    midiCC = [addMidiCCVal()]
  }
  if (type === LABEL) {
    label = 'Label ' + addStateLength()
  }
  if (type === PAGE) {
    label = 'Page ' + addStateLength()
  }
  if (type === XYPAD) {
    label = 'X / Y Pad ' + addStateLength()
    yVal = 50
    midiCC = [addMidiCCVal()]
    yDriverName = 'None'
    yMidiCc = [addMidiCCVal()]
    yMidiChannel = 1
    yMinVal = 0
    yMaxVal = 127
  }
  const entry = {
    type,
    label,
    val: 50,
    lastSavedVal: 0,
    minVal: 0,
    maxVal: 127,
    onVal: 127,
    offVal: 0,
    midiCC,
    listenToCc: [],
    driverName: newDriverName,
    driverNameInput: 'None',
    yDriverName,
    yVal,
    yMidiCc,
    yMidiChannel,
    yMinVal,
    yMaxVal,
    midiChannel: 1,
    midiChannelInput: 1,
    isNoteOn: false,
    isDraggable: true,
    i: id,
    x: addStateLength(),
    y: addStateLength(),
    w: type === PAGE ? 18 : 2,
    h: type === SLIDER ? 6 : 3,
    static: false,
    colors: {
      color: 'rgba(126, 211, 33, 1)',
      colorActive: 'rgba(184, 233, 134, 1)',
      colorFont: 'rgba(244, 166, 34, 1)',
      colorFontActive: 'rgba(248, 233, 28, 1)'
    },
    fontSize: 16,
    fontWeight: 500,
    isValueHidden: false
  }
  return createNextState(state, (draftState) => {
    if (type === PAGE) {
      draftState = { ...state, sliderList: [] }
    } else {
      draftState = { ...state, sliderList: [...oldSliderList, entry] }
    }
    return draftState
  })
}

function toggleNotesInState(list, i) {
  return list.map((item) => {
    if (item.i === i) {
      const res = {
        ...item,
        isNoteOn: !item.isNoteOn,
        val: !item.isNoteOn ? item.onVal : item.offVal
      }
      return res
    } else {
      return item
    }
  })
}

function sendControlChanges({ midiCC, midiChannel, driverName, val }) {
  WebMIDI.octaveOffset = -1
  const output = getCheckedMidiOut(driverName)
  if (Array.isArray(midiCC)) {
    midiCC.forEach((item) => {
      const cc = midi(item)
      output && output.sendControlChange(cc, val, parseInt(midiChannel, 10))
    })
  }
}

function toggleNotes({
  onVal,
  offVal,
  midiCC,
  midiChannel,
  driverName,
  isNoteOn
}) {
  WebMIDI.octaveOffset = -1
  const output = getCheckedMidiOut(driverName)
  const onValInt = (onVal && parseInt(onVal, 10)) || 127
  const offValInt = (offVal === 0 && 0) || (offVal && parseInt(offVal, 10)) || 0
  if (!isNoteOn) {
    output &&
      output.playNote(midiCC, midiChannel, {
        rawVelocity: true,
        velocity: onValInt
      })
  } else {
    output &&
      output.stopNote(midiCC, midiChannel, {
        rawVelocity: true,
        velocity: offValInt
      })
  }
}

function getCheckedMidiOut(driverName) {
  const output = driverName !== 'None' && WebMIDI.getOutputByName(driverName)
  return output
}

function updatePagesWithSliderlist(state, refreshedSliderList = []) {
  return createNextState(state, (draftState) => {
    draftState.sliderList = refreshedSliderList
    return draftState
  })
}

function scaleToMinMax(val, min, max) {
  const v = parseInt(val, 10)
  let newVal = null
  if (v <= max && v >= min) {
    newVal = val
  } else if (v > max) {
    newVal = max
  } else {
    newVal = min
  }
  return newVal
}
