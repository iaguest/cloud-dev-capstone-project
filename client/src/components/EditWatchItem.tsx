import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { patchWatchItem } from '../api/watchlist-api'

interface EditWatchItemProps {
  match: {
    params: {
      watchId: string
    }
  }
  auth: Auth
}

interface EditWatchItemState {
  alertPrice?: number
}

export class EditWatchItem extends React.PureComponent<
  EditWatchItemProps,
  EditWatchItemState
> {
  state: EditWatchItemState = {
    alertPrice: undefined
  }

  handleAlertPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const alertPrice = event.target.value
    this.setState({
      alertPrice: (alertPrice) ? parseFloat(alertPrice) : undefined
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      await patchWatchItem(this.props.auth.getIdToken(),
                           this.props.match.params.watchId,
                           { alertPrice: this.state.alertPrice})
    } catch (e) {
       alert('Could not set alert: ' + e.message)
    }
  }

  render() {
    return (
      <div>
        <h1>Set alert</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Price</label>
            <input
              type="text"
              value={this.state.alertPrice || ''} 
              onChange={this.handleAlertPriceChange}
            />
            <input type="submit" value="Apply" />
          </Form.Field>
        </Form>

        <br/>
        <p>Applying an empty value will clear any pre-existing alert</p>
      </div>
    )
  }
}
