import WebMIDI from 'webmidi'
import { Actions } from './slider-list'

const { initPending, midiMessageArrived, initFailed, initMidiAccess } = Actions

export function initApp() {
  return function(dispatch, getState) {
    dispatch(initPending('start'))
    WebMIDI.disable()
    WebMIDI.enable(err => {
      if (err) {
        window.alert('Midi could not be enabled.', err)
        dispatch(initFailed('Midi could not be enabled.'))
      }
      const { inputs = [], outputs = [] } = WebMIDI

      const midiAccess = {
        inputs,
        outputs,
      }
      if (hasContent(outputs)) {
        dispatch(initMidiAccess({ midiAccess }))
      } else {
        dispatch(initFailed('No Midi Output available.'))
      }
      const {
        sliders: { sliderList },
        viewSettings: {
          availableDrivers: { inputs: availableInputs } = {
            inputs: {
              None: {
                ccChannels: [],
                noteChannels: [],
              },
            },
          },
        },
      } = getState()

      inputs &&
        Array.isArray(inputs) &&
        inputs.forEach(input => {
          const { name } = input
          const { ccChannels, noteChannels } = availableInputs[name] || {
            ccChannels: [],
            noteChannels: [],
          }
          let ccArr = []
          sliderList &&
            sliderList.forEach(entry => {
              const { driverNameInput = '', listenToCc = [] } = entry

              if (name === driverNameInput) {
                listenToCc.forEach(listen => {
                  if (!ccArr.includes(listen)) {
                    ccArr.push(parseInt(listen, 10))
                  }
                })
              }
            })
          input.removeListener()
          if (
            Array.isArray(ccChannels) &&
            hasContent(ccChannels) &&
            hasContent(ccArr)
          ) {
            console.log('Add cc listener ', name, ' ', ccArr)
            input.addListener(
              'controlchange',
              ccChannels,
              ({ value, channel, controller: { number } }) => {
                if (ccArr.includes(number)) {
                  const obj = {
                    isNoteOn: undefined,
                    val: value,
                    cC: number,
                    channel,
                    driver: name,
                  }
                  dispatch(midiMessageArrived(obj))
                }
              }
            )
          }
          if (
            Array.isArray(noteChannels) &&
            hasContent(noteChannels) &&
            hasContent(ccArr)
          ) {
            console.log('Add note listener ', name, ' ', ccArr)
            input.addListener('noteon', noteChannels, event => {
              const {
                rawVelocity,
                channel,
                note: { number },
              } = event
              if (ccArr.includes(number)) {
                const obj = {
                  isNoteOn: true,
                  val: rawVelocity,
                  cC: number,
                  channel,
                  driver: name,
                }
                dispatch(midiMessageArrived(obj))
              }
            })
            input.addListener(
              'noteoff',
              noteChannels,
              ({ rawVelocity, channel, note: { number } }) => {
                if (ccArr.includes(number)) {
                  const obj = {
                    isNoteOn: false,
                    val: rawVelocity,
                    cC: number,
                    channel,
                    driver: name,
                  }
                  dispatch(midiMessageArrived(obj))
                }
              }
            )
          }
        })
    })
  }
}

const hasContent = arr => arr.length > 0
