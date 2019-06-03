import { MIDIMonitorLabel } from '../MIDIMonitorLabel'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { map } from 'lodash'
import RGL, { WidthProvider } from 'react-grid-layout'
import Typography from '@material-ui/core/Typography'
import ChannelStrip from '../channel-strip/ChannelStrip'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Actions as MidiSliderActions } from '../../actions/slider-list.js'
import { Actions as ViewSettingsActions } from '../../actions/view-settings.js'
import { ActionCreators as UndoActions } from 'redux-undo'
import { thunkChangeListOrder } from '../../actions/thunks/thunk-change-list-order'
import MidiSettingsDialogButton from '../midi-settings-dialog/MidiSettingsDialogButton'
import { makeStyles } from '@material-ui/styles'
import { SizeMe } from 'react-sizeme'
import { PAGE_TYPES } from '../../reducers'
import { Button } from '@material-ui/core'
import { thunkLoadFile } from '../../actions/thunks/thunk-load-file'
import { preset } from '../../utils/midi-bricks-preset-apc-40.js'
require('react-grid-layout/css/styles.css')
require('react-resizable/css/styles.css')

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChannelStripList)

// eslint-disable-next-line new-cap
const GridLayout = WidthProvider(RGL)

function ChannelStripList(props) {
  const classes = makeStyles(styles, { withTheme: true })()
  const {
    actions,
    thunkLoadFile,
    thunkChangeListOrder,
    sliderList = [],
    monitorVal: { driver = 'None', cC = 'None', channel = 'None' } = {},
    viewSettings: {
      pageType,
      pageTargets,
      isLayoutMode = true,
      isCompactHorz = false,
      isAutoArrangeMode = true,
      isSettingsMode = true,
      isSettingsDialogMode = false,
      // isLiveMode = false,
      isMidiLearnMode = false,
      lastFocusedIdxs = [],
      lastFocusedPage,
      rowHeight,
      columns,
      isAutoSize,
      marginX,
      marginY,
      paddingX,
      paddingY
    }
  } = props

  let elem = document.body

  useEffect(() => {
    const keypressRef = (e) => handleKeyPress(actions, isLayoutMode, e)

    // Protect dialog mode from global listeners
    if (!isSettingsDialogMode) {
      console.log('Add Keypress Listener')
      elem.addEventListener('keypress', keypressRef)
    }

    // clean up
    return () => {
      console.log('clean up -> Remove Keypress Listener ')
      elem.removeEventListener('keypress', keypressRef)
    }
  }, [isSettingsDialogMode, isLayoutMode, elem, pageType, actions])

  if (sliderList && sliderList.length > 0) {
    return (
      <GridLayout
        margin={[marginX, marginY]}
        containerPadding={[paddingX, paddingY]}
        autoSize={isAutoSize}
        style={{ bottom: 48, top: 8, height: 'calc(100vh - 120px)' }}
        rowHeight={rowHeight}
        cols={columns}
        useCSSTransforms
        //isRearrangeable={isAutoArrangeMode}
        preventCollision={!isAutoArrangeMode}
        isDraggable={isLayoutMode}
        isResizable={isLayoutMode}
        compactType={isCompactHorz ? 'horizontal' : 'vertical'}
        layout={sliderList}
        onLayoutChange={
          isLayoutMode
            ? onLayoutChange.bind(
                this,
                thunkChangeListOrder,
                isLayoutMode,
                lastFocusedPage
              )
            : () => {}
        }
      >
        {map(sliderList, (sliderEntry, idx) => {
          const { i } = sliderEntry
          const isFocused = lastFocusedIdxs.includes(i)
          return (
            <div
              onDoubleClick={(e) => {
                actions.setLastFocusedIndex({ i })
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={
                !isLayoutMode &&
                isSettingsMode &&
                !isSettingsDialogMode &&
                !lastFocusedIdxs.includes(i)
                  ? (e) => {
                      actions.setLastFocusedIndex({ i })
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  : () => {}
              }
              key={i}
              style={
                (isMidiLearnMode || isSettingsMode) &&
                isFocused && {
                  borderRadius: 3,
                  overflow: isMidiLearnMode && 'hidden',
                  boxShadow: isSettingsMode
                    ? '0 0 3px 3px rgb(24, 154, 157)'
                    : '0 0 3px 3px rgb(212, 28, 138)'
                }
              }
            >
              <SizeMe monitorHeight>
                {({ size }) => {
                  return (
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 3,
                        background: isLayoutMode
                          ? '#f0ffff87'
                          : isSettingsMode
                          ? '#f5f5dcb3'
                          : isMidiLearnMode
                          ? '#cfcfcf'
                          : 'transparent'
                      }}
                    >
                      {isMidiLearnMode && isFocused && (
                        <MIDIMonitorLabel
                          isSettings={false}
                          midiInfo={{ driver, cC, channel }}
                          midiLearnTypo={classes.midiLearnTypo}
                        />
                      )}
                      <ChannelStrip
                        size={size}
                        sliderEntry={sliderEntry}
                        isDisabled={isLayoutMode || isSettingsMode}
                        isMidiLearnMode={isMidiLearnMode}
                      />
                      {!isMidiLearnMode && isSettingsMode && !isLayoutMode && (
                        <span
                          className='settings'
                          style={{
                            position: 'absolute',
                            right: -12,
                            top: -16,
                            cursor: 'pointer'
                          }}
                        >
                          <MidiSettingsDialogButton
                            isOpen={
                              !!(
                                isSettingsDialogMode &&
                                lastFocusedIdxs !== undefined &&
                                isFocused
                              )
                            }
                            toggleSettings={toggleSettings.bind(
                              this,
                              lastFocusedPage,
                              i,
                              actions
                            )}
                            sliderEntry={sliderEntry}
                          />
                        </span>
                      )}
                    </div>
                  )
                }}
              </SizeMe>
            </div>
          )
        })}
      </GridLayout>
    )
  } else if (pageTargets.length < 2) {
    return (
      <Typography variant='h4' className={classes.noMidiTypography}>
        <br />
        <br />
        <Button
          onClick={async () => await thunkLoadFile(preset, preset.presetName)}
        >
          LOAD EXAMPLE
        </Button>
        <br />
        <br />
      </Typography>
    )
  } else {
    return (
      <Typography variant='h5' className={classes.noMidiTypography}>
        <br />
        <br />
        <br />
        <br />
        Add an element in layout-mode via plus-sign at the top right corner.
      </Typography>
    )
  }
}

ChannelStripList.propTypes = {
  actions: PropTypes.object,
  sliderList: PropTypes.array,
  viewSettings: PropTypes.object
}

function onLayoutChange(
  thunkChangeListOrder,
  isLayoutMode,
  lastFocusedPage,
  layout
) {
  if (isLayoutMode) {
    thunkChangeListOrder(layout, lastFocusedPage)
  }
}

function handleKeyPress(actions, isLayoutMode, e) {
  // e: midi driver settings
  // if (e.keyCode === 101) {
  //   const {
  //     viewSettings: { isMidiLearnMode },
  //     actions,
  //   } = props
  //   if (!isMidiLearnMode) {
  //     await initApp('all')
  //     e.preventDefault()
  //     actions.toggleMidiLearnMode(true)
  //   }
  // }

  // m: midi driver settings
  if (e.keyCode === 109) {
    e.preventDefault()
    actions.togglePage({ pageType: PAGE_TYPES.MIDI_DRIVER_MODE })
  }

  // g: global midi settings
  if (e.keyCode === 103) {
    e.preventDefault()
    actions.togglePage({ pageType: PAGE_TYPES.GLOBAL_MODE })
  }

  // z: go back
  if (e.keyCode === 122) {
    e.preventDefault()
    //actions.goBack()
  }

  // p: performance (live) mode
  if (e.keyCode === 112) {
    e.preventDefault()
    actions.toggleLiveMode()
    actions.clearHistory()
  }

  // l: layout mode
  if (e.keyCode === 108) {
    e.preventDefault()
    actions.toggleLayoutMode()
  }

  // s: settings mode
  if (e.keyCode === 115) {
    if (!isLayoutMode) {
      e.preventDefault()
      actions.toggleSettingsMode()
      return false
    }
  }

  // a: auto arrange mode
  if (e.keyCode === 97) {
    if (isLayoutMode) {
      e.preventDefault()
      actions.toggleAutoArrangeMode()
    }
  }

  // d: duplicate last added element
  if (e.keyCode === 100) {
    e.preventDefault()
    actions.clone()
  }

  // v: vertical / horizontal compact mode
  if (e.keyCode === 118) {
    e.preventDefault()
    actions.toggleCompactMode()
  }

  // t: theme
  if (e.keyCode === 116) {
    e.preventDefault()
    actions.changeTheme()
  }
}

function styles(theme) {
  return {
    channelList: {
      display: 'flex'
      // overflowX: 'scroll'
    },
    midiLearnTypo: {
      color: theme.palette.primary.contrastText,
      fontSize: 12,
      fontWeight: 500
    }
  }
}

function toggleSettings(lastFocusedPage, i, actions, { isSettingsDialogMode }) {
  actions.toggleSettingsDialogMode({ i, lastFocusedPage, isSettingsDialogMode })
}

function mapStateToProps({
  viewSettings,
  sliders: {
    present: { sliderList, monitorVal }
  }
}) {
  return {
    viewSettings,
    sliderList,
    monitorVal
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...MidiSliderActions, ...ViewSettingsActions, ...UndoActions },
      dispatch
    ),
    thunkLoadFile: bindActionCreators(thunkLoadFile, dispatch),
    thunkChangeListOrder: bindActionCreators(thunkChangeListOrder, dispatch)
  }
}
