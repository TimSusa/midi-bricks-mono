import React from 'react'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/lab/Slider'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as MidiSliderActions from '../../../actions/slider-list.js'

class MidiSlider extends React.Component {
  static defaultProps = {
    height: 0
  }
  render () {
    const { sliderEntry, idx, height } = this.props
    const { classes } = this.props
    console.log('widht sllider ', idx, height)
    return (
      <React.Fragment>
        <Slider
          style={{height: (height || 0) - 150}}
          classes={{
            root: classNames({
              [classes.sliderRoot]: true
            }),
            vertical: classes.vertical,
            activated: classes.activated,
            jumped: classes.jumped,
            track: classes.track,
            trackBefore: classes.trackBefore,
            trackAfter: classes.trackAfter,
            thumb: classes.thumb
          }}
          vertical
          reverse
          value={sliderEntry.val}
          onChange={this.handleSliderChange.bind(this, idx)}
          onTouchStart={this.touchToMouseEvent}
          onTouchEnd={this.touchToMouseEvent}
          onTouchMove={this.touchToMouseEvent}
          max={127}
          min={0}
          step={1}
        />
        <Typography className={classes.caption}>{sliderEntry.val}</Typography>
      </React.Fragment>
    )
  }

  handleSliderChange = (idx, e, val) => {
    this.props.actions.handleSliderChange({ idx, val })
  }

  // In order to have multi-touch available,
  // convert touch to mouse events
  touchToMouseEvent = (e) => {
    [...e.touches].forEach((touch) => {
      const evt = new window.MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        relatedTarget: touch.target
      })
      window.requestAnimationFrame(() => {
        touch.target.dispatchEvent(evt)
        evt.preventDefault()
      })
    })
  }
}

const styles = theme => ({
  sliderRoot: {
    // width: '100%',
    cursor: 'default',

    '&$vertical': {
      // height: 'calc(100vh - 258px)',
      margin: 0,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  vertical: {
  },
  activated: {},
  jumped: {
    transition: 'none'
  },
  track: {
    '&$vertical': {
      width: 80,
      border: 'solid 1px rgba(0,0,0,0.1)',
      borderRadius: 2
    }
  },
  trackBefore: {
    background: theme.palette.secondary.dark,
    '&$activated': {
    }
  },
  trackAfter: {
    background: theme.palette.primary.light,
    '&$activated': {
      background: theme.palette.primary.light
    },
    '&$jumped': {
      background: theme.palette.primary.light
    }
  },
  thumb: {
    width: 80,
    height: 40,
    left: '50%',
    borderRadius: 2,
    border: 'solid 1px rgba(0,0,0,0.2)',

    '&$activated': {
      boxShadow: '0 0 3px 3px grey',
      width: 84,
      height: 40,
      background: theme.palette.primary.dark
    },
    '&$jumped': {
      width: 80,
      height: 40
    }
  },
  caption: {
    textAlign: 'center',
    marginTop: theme.spacing.unit,
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  }
})

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(MidiSliderActions, dispatch)
  }
}

export default (withStyles(styles)(connect(null, mapDispatchToProps)(MidiSlider)))
