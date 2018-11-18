import {
  withStyles,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Tooltip
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as MidiSliderActions from '../actions/slider-list.js'
import * as ViewStuff from '../actions/view-settings.js'
import MidiSettingsDialog from '../components/channel-strip-list/channel-strip/midi-settings-dialog/MidiSettingsDialog'

class GlobalSettingsPage extends React.PureComponent {
  render () {
    const { classes, sliderList, midi, viewSettings: { isSettingsDialogMode, lastFocusedIdx } } = this.props

    return (
      <Table
        className={classes.root}
      >
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Note(s)/CC</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Listeners</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            sliderList && sliderList.map((sliderEntry, idx) => {
              const { driverName, outputId } = this.outputIdToDriverName(midi.midiDrivers, sliderEntry.outputId, sliderEntry.driverName)
              const rowStyle = {
                background: (!outputId && !['PAGE', 'LABEL'].includes(sliderEntry.type)) ? 'red' : 'none',
                cursor: 'pointer'
              }

              if (isSettingsDialogMode && (idx === lastFocusedIdx)) {
                return (
                  <MidiSettingsDialog
                    key={`glb-settings-${idx}`}
                    open
                    onClose={this.props.actions.toggleSettingsDialogMode.bind(this, { idx, isSettingsDialogMode: false })}
                    sliderEntry={sliderEntry}
                    idx={idx}
                  />
                )
              }
              let title = ''
              if (!['PAGE', 'LABEL'].includes(sliderEntry.type)) {
                if (outputId && driverName) {
                  title = driverName
                } else if (!driverName) {
                  title = 'No MIDI Driver available'
                } else if (!outputId) {
                  title = 'Driver ID cannot be found. Please reselect the driver.'
                }
              }

              return (
                <Tooltip
                  title={title}
                  key={`glb-${idx}`}
                >
                  <TableRow
                    style={rowStyle}
                    onClick={this.props.actions.toggleSettingsDialogMode.bind(this, { idx, isSettingsDialogMode: true })}
                  >
                    <TableCell>
                      {sliderEntry.label || '-'}
                    </TableCell>
                    <TableCell>
                      {sliderEntry.type}
                    </TableCell>
                    <TableCell style={{ color: !driverName && 'grey' }}>
                      {driverName || sliderEntry.driverName || 'None'}
                    </TableCell>
                    <TableCell>
                      {sliderEntry.midiChannel}
                    </TableCell>
                    <TableCell>
                      {(sliderEntry.midiCC && (sliderEntry.midiCC.length > 0) && this.renderListeners(sliderEntry.midiCC)) || '-'}
                    </TableCell>
                    <TableCell>
                      {!['PAGE', 'LABEL'].includes(sliderEntry.type) ? sliderEntry.val : '-'}
                    </TableCell>
                    <TableCell>
                      {(sliderEntry.listenToCc && (sliderEntry.listenToCc.length > 0) && this.renderListeners(sliderEntry.listenToCc)) || '-'}
                    </TableCell>
                  </TableRow>
                </Tooltip>

              )
            })
          }
        </TableBody>
      </Table>
    )
  }

  renderListeners = (tmp) => {
    return (<div>{tmp.join(', ')}</div>)
  }

  outputIdToDriverName = (drivers, outputId, driverName) => {
    let name = ''
    let outputIdOut
    drivers.forEach((item) => {
      if (item.name === driverName) {
        name = item.name
      }
      if (item.outputId === outputId) {
        outputIdOut = outputId
      }
    })
    return { driverName: name, outputId: outputIdOut }
  }
}

const styles = theme => ({
  root: {
    textAlign: 'left',
    width: '100%'
  },
  heading: {
    marginTop: theme.spacing.unit * 2
  }
})

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators({ ...MidiSliderActions, ...ViewStuff }, dispatch)
  }
}
function mapStateToProps ({ sliders: { sliderList, midi }, viewSettings }) {
  return {
    sliderList,
    midi,
    viewSettings
  }
}
export default (withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(GlobalSettingsPage)))