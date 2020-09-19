import React, { useState } from 'react'
import DriverExpansionPanel from '../components/DriverExpansionPanel'
import MidiDriverTable from '../components/MidiDriverTable'
import { useSelector, useDispatch } from 'react-redux'
import { Actions as MidiSliderActions } from '../global-state/actions/slider-list.js'
import { Actions as ViewStuff } from '../global-state/actions/view-settings.js'

const { setAvailableDrivers } = { ...MidiSliderActions, ...ViewStuff }
export const MidiDriversSettingsPage = MidiDriversSettingsPageComponent

function MidiDriversSettingsPageComponent() {
  const dispatch = useDispatch()
  const { inputs: availableInputs, outputs: avalableOutputs } = useSelector(
    (state) => state.viewSettings.availableDrivers
  )
  const { inputs, outputs } = useSelector(
    (state) => state.sliders.midi.midiAccess
  )

  const [isFirstPanelExpanded, setIsFirstPanelExpanded] = useState(true)
  const [isScndPanelExpanded, setIsScndPanelExpanded] = useState(true)

  if (!Array.isArray(outputs) || !inputs) return <div></div>
  let isChecked = false
  return (
    <React.Fragment>
      <DriverExpansionPanel
        label='Output MIDI Driver'
        expanded={isScndPanelExpanded}
        noPadding={true}
        onChange={() => setIsScndPanelExpanded(!isScndPanelExpanded)}
      >
        {outputs &&
          outputs.map((name, idx) => {
            const { ccChannels, noteChannels } = avalableOutputs[name] || {
              ccChannels: [],
              noteChannels: []
            }
            const isNotEmpty =
              (ccChannels && ccChannels.length > 0) ||
              (noteChannels && noteChannels.length > 0)
            return (
              <DriverExpansionPanel
                key={`output-midi-${idx}`}
                label={name}
                isEmpty={!isNotEmpty}
                noPadding={true}
              >
                <MidiDriverTable
                  labelPostfix='Out'
                  idx={idx}
                  available={avalableOutputs}
                  name={name}
                  handleCheckboxClickNote={handleCheckboxClickNoteOut.bind(
                    this,
                    name
                  )}
                  handleCheckboxClickCc={handleCheckboxClickCcOut.bind(
                    this,
                    name
                  )}
                />
              </DriverExpansionPanel>
            )
          })}
      </DriverExpansionPanel>
      <DriverExpansionPanel
        label='Input MIDI Driver'
        expanded={isFirstPanelExpanded}
        noPadding={true}
        onChange={() => setIsFirstPanelExpanded(!isFirstPanelExpanded)}
      >
        {inputs &&
          inputs.map((name, idx) => {
            const { ccChannels, noteChannels } = availableInputs[name] || {
              ccChannels: [],
              noteChannels: []
            }
            const isNotEmpty =
              (ccChannels && ccChannels.length > 0) ||
              (noteChannels && noteChannels.length > 0)
            return (
              <DriverExpansionPanel
                key={`input-midi-${idx}`}
                label={name}
                isEmpty={!isNotEmpty}
                noPadding={true}
              >
                <MidiDriverTable
                  labelPostfix='In'
                  idx={idx}
                  available={availableInputs}
                  name={name}
                  handleCheckboxClickNote={handleCheckboxClickNoteIn.bind(
                    this,
                    name
                  )}
                  handleCheckboxClickCc={handleCheckboxClickCcIn.bind(
                    this,
                    name
                  )}
                />
              </DriverExpansionPanel>
            )
          })}
      </DriverExpansionPanel>
    </React.Fragment>
  )
  function handleCheckboxClickNoteIn(name, e) {
    dispatch(
      setAvailableDrivers({
        input: {
          name,
          noteChannel: e.target.value,
          isChecked: !isChecked
        }
      })
    )
  }
  function handleCheckboxClickCcIn(name, e) {
    dispatch(
      setAvailableDrivers({
        input: {
          name,
          ccChannel: e.target.value,
          isChecked: !isChecked
        }
      })
    )
  }
  function handleCheckboxClickNoteOut(name, e) {
    dispatch(
      setAvailableDrivers({
        output: {
          name,
          noteChannel: e.target.value,
          isChecked: !isChecked
        }
      })
    )
  }
  function handleCheckboxClickCcOut(name, e) {
    dispatch(
      setAvailableDrivers({
        output: {
          name,
          ccChannel: e.target.value,
          isChecked: !isChecked
        }
      })
    )
  }
}

// function handleChange(panel) {
//   return function(event, expanded) {
//     setState({
//       expanded: expanded ? panel : false
//     })
//   }
// }
