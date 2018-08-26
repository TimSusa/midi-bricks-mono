import React from 'react'
import PropTypes from 'prop-types'
// import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'

import MidiSettings from './expanded-strip/MidiSettings'

class ConfirmationDialogRaw extends React.Component {
  render () {
    const { sliderEntry, idx, ...other } = this.props
    return (
      <Dialog
        onKeyDown={this.handleKeydown}
        disableBackdropClick
        disableEscapeKeyDown
        aria-labelledby='confirmation-dialog-title'
        {...other}
      >
        <DialogTitle id='confirmation-dialog-title'>Settings</DialogTitle>
        <DialogContent>
          <MidiSettings sliderEntry={sliderEntry} idx={idx} />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

    handleClose = () => {
      this.props.onClose()
    }

    handleKeydown = (e) => {
      // Enter will close dialog
      if (e.keyCode === 13) {
        this.props.onClose()
        e.preventDefault()
      }
    }
}

ConfirmationDialogRaw.propTypes = {
  onClose: PropTypes.func,
  value: PropTypes.string
}

export default ConfirmationDialogRaw
