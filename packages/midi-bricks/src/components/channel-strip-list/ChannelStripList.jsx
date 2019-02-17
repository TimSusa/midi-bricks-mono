import React from 'react'
import RGL, { WidthProvider } from 'react-grid-layout'
import Typography from '@material-ui/core/Typography'
import ChannelStrip from '../channel-strip/ChannelStrip'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Actions as MidiSliderActions } from '../../actions/slider-list.js'
import { Actions as ViewSettingsActions } from '../../actions/view-settings.js'
import { initApp } from '../../actions/init.js'
import MidiSettingsDialogButton from '../midi-settings-dialog/MidiSettingsDialogButton'
import { withStyles } from '@material-ui/core/styles'
import { SizeMe } from 'react-sizeme'
import { PAGE_TYPES } from '../../reducers/view-settings'
require('react-grid-layout/css/styles.css')
require('react-resizable/css/styles.css')

const GridLayout = WidthProvider(RGL)

class ChannelStripList extends React.PureComponent {
  hasListener = false
  hasPages = false

  componentWillUnmount() {
    if (this.hasListener) {
      document.body.removeEventListener('keypress', this.handleKeyPress)
      this.hasListener = false
    }
  }

  render() {
    const {
      classes,
      actions,
      sliderList,
      viewSettings: {
        isLayoutMode = true,
        isCompactHorz = true,
        isAutoArrangeMode = true,
        isSettingsMode = true,
        isSettingsDialogMode = false,
        isLiveMode = false,
        lastFocusedIdx,
      },
    } = this.props

    // Protect dialog mode from global listeners
    if (isSettingsDialogMode || isLiveMode) {
      if (this.hasListener) {
        document.body.removeEventListener('keypress', this.handleKeyPress)
        this.hasListener = false
      }
    } else {
      if (!this.hasListener) {
        document.body.addEventListener('keypress', this.handleKeyPress)
        this.hasListener = true
      }
    }

    if (sliderList && sliderList.length > 0) {
      return (
        <GridLayout
          style={{ bottom: 48, top: 8, height: 'calc(100vh - 120px)' }}
          rowHeight={40}
          cols={18}
          preventCollision={!isAutoArrangeMode}
          isDraggable={isLayoutMode}
          isResizable={isLayoutMode}
          compactType={isCompactHorz ? 'horizontal' : 'vertical'}
          layout={sliderList}
          onLayoutChange={isLayoutMode ? this.onLayoutChange : () => {}}
        >
          {sliderList.map((sliderEntry, idx) => {
            return (
              <div
                key={sliderEntry.i}
                onFocus={e => console.log('focus on ', sliderEntry.i)}
              >
                <SizeMe monitorHeight>
                  {({ size }) => {
                    {
                      const settingsStyle = {
                        position: 'absolute',
                        right: -12,
                        top: -16,
                        cursor: 'pointer',
                      }
                      return (
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 5,
                            background: isLayoutMode
                              ? 'azure'
                              : isSettingsMode
                              ? 'beige'
                              : 'transparent',
                          }}
                        >
                          <ChannelStrip
                            size={size}
                            sliderEntry={sliderEntry}
                            idx={idx}
                            isDisabled={isLayoutMode}
                          />
                          {isSettingsMode && !isLayoutMode ? (
                            <span className="settings" style={settingsStyle}>
                              <MidiSettingsDialogButton
                                toggleSettings={
                                  actions.toggleSettingsDialogMode
                                }
                                lastFocusedIdx={lastFocusedIdx}
                                isSettingsDialogMode={isSettingsDialogMode}
                                sliderEntry={sliderEntry}
                                idx={idx}
                              />
                            </span>
                          ) : (
                            <div />
                          )}
                        </div>
                      )
                    }
                  }}
                </SizeMe>
              </div>
            )
          })}
        </GridLayout>
      )
    } else {
      return (
        <Typography variant="h4" className={classes.noMidiTypography}>
          <br />
          <br />
          At first, please add a page.
          <br />
          <br />
          You can do this with the button at the right top in the AppBar → ↑
        </Typography>
      )
    }
  }

  onLayoutChange = layout => {
    if (this.props.viewSettings.isLayoutMode) {
      this.props.actions.changeListOrder({ listOrder: layout })
    }
  }

  handleKeyPress = e => {
    // m: midi driver settings
    if (e.keyCode === 109) {
      e.preventDefault()
      this.props.actions.togglePage({ pageType: PAGE_TYPES.MIDI_DRIVER_MODE })
    }

    // g: global midi settings
    if (e.keyCode === 103) {
      e.preventDefault()
      this.props.actions.togglePage({ pageType: PAGE_TYPES.GLOBAL_MODE })
    }

    // z: go back
    if (e.keyCode === 122) {
      e.preventDefault()
      this.props.actions.goBack()
    }

    // p: performance (live) mode
    if (e.keyCode === 112) {
      e.preventDefault()
      this.props.actions.toggleLiveMode()
    }

    // l: layout mode
    if (e.keyCode === 108) {
      e.preventDefault()
      this.props.actions.toggleLayoutMode()
    }

    // s: settings mode
    if (e.keyCode === 115) {
      if (!this.props.viewSettings.isLayoutMode) {
        e.preventDefault()
        this.props.actions.toggleSettingsMode()
        return false
      }
    }

    // a: auto arrange mode
    if (e.keyCode === 97) {
      if (this.props.viewSettings.isLayoutMode) {
        e.preventDefault()
        this.props.actions.toggleAutoArrangeMode()
      }
    }

    // d: duplicate last added element
    if (e.keyCode === 100) {
      e.preventDefault()
      this.props.actions.clone()
    }

    // v: vertical / horizontal compact mode
    if (e.keyCode === 118) {
      e.preventDefault()
      this.props.actions.toggleCompactMode()
    }

    // t: theme
    if (e.keyCode === 116) {
      e.preventDefault()
      this.props.actions.changeTheme()
    }
  }
}

const styles = theme => ({
  channelList: {
    display: 'flex',
    // overflowX: 'scroll'
  },
})

function mapStateToProps({ viewSettings, sliders: { sliderList } }) {
  return {
    viewSettings,
    sliderList,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...MidiSliderActions, ...ViewSettingsActions },
      dispatch
    ),
    initApp: bindActionCreators(initApp, dispatch),
  }
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ChannelStripList)
)