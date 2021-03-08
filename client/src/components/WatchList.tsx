import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createWatchItem, deleteWatchItem, getWatchItems, patchWatchItem } from '../api/watchlist-api'
import Auth from '../auth/Auth'
import { WatchItem } from '../types/WatchItem'

interface WatchListProps {
  auth: Auth
  history: History
}

interface WatchListState {
  watchItems: WatchItem[]
  newTicker: string
  loadingWatchItems: boolean
}

export class WatchList extends React.PureComponent<WatchListProps, WatchListState> {
  state: WatchListState = {
    watchItems: [],
    newTicker: '',
    loadingWatchItems: true
  }

  handleTickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTicker: event.target.value })
  }

  onEditButtonClick = (watchId: string) => {
    this.props.history.push(`/watchlist/${watchId}/edit`)
  }

  onWatchItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      // const dueDate = this.calculateDueDate()
      const newWatchItem = await createWatchItem(this.props.auth.getIdToken(), {
        ticker: this.state.newTicker
      })
      this.setState({
        watchItems: [...this.state.watchItems, newWatchItem],
        newTicker: ''
      })
    } catch {
      alert('WatchItem creation failed')
    }
  }

  onWatchItemDelete = async (watchId: string) => {
    try {
      await deleteWatchItem(this.props.auth.getIdToken(), watchId)
      this.setState({
        watchItems: this.state.watchItems.filter(watchItem => watchItem.watchId != watchId)
      })
    } catch {
      alert('WatchItem deletion failed')
    }
  }

  onWatchItemCheck = async (pos: number) => {
    try {
      const watchItem = this.state.watchItems[pos]
      await patchWatchItem(this.props.auth.getIdToken(), watchItem.watchId, {
        alertPrice: watchItem.price,
      })
      this.setState({
        watchItems: update(this.state.watchItems, {
          // HACK: XXX what to do on update here?
          // [pos]: { done: { $set: !watchItem.done } }
        })
      })
    } catch {
      alert('WatchItem deletion failed')  // Deletion?
    }
  }

  async componentDidMount() {
    try {
      const todos = await getWatchItems(this.props.auth.getIdToken())
      this.setState({
        watchItems: todos,
        loadingWatchItems: false
      })
    } catch (e) {
      alert(`Failed to fetch watch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Watch List</Header>

        {this.renderCreateWatchItemInput()}

        {this.renderWatchList()}
      </div>
    )
  }

  renderCreateWatchItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New watch',
              onClick: this.onWatchItemCreate
            }}
            fluid
            actionPosition="left"
            placeholder="AAPL"
            onChange={this.handleTickerChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderWatchList() {
    if (this.state.loadingWatchItems) {
      return this.renderLoading()
    }

    return this.renderWatchItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading watch list
        </Loader>
      </Grid.Row>
    )
  }

  renderWatchItemsList() {
    return (
      <Grid padded>
        {this.state.watchItems.map((watchItem, pos) => {
          return (
            <Grid.Row key={watchItem.watchId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onWatchItemCheck(pos)}
                  // HACK XXX: Any use for this?
                  // checked={watchItem.done}
                />
              </Grid.Column> */}
              <Grid.Column width={3} verticalAlign="middle">
                {watchItem.ticker}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {watchItem.description}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {watchItem.price.toFixed(2)}{watchItem.currency} {(watchItem.alertPrice ? `[${watchItem.alertPrice.toFixed(2)}]` : '')}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {watchItem.timeStamp}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(watchItem.watchId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onWatchItemDelete(watchItem.watchId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {/* {watchItem.attachmentUrl && (
                <Image src={watchItem.attachmentUrl} size="small" wrapped />
              )} */}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  // calculateDueDate(): string {
  //   const date = new Date()
  //   date.setDate(date.getDate() + 7)

  //   return dateFormat(date, 'yyyy-mm-dd') as string
  // }
}
