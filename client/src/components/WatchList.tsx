import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import { userInfo } from 'os'
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

import { getUserInfo } from '../api/userinfo-api'
import { updateUserInfo } from '../api/userinfo-api'
import { createWatchItem, deleteWatchItem, getWatchItems, refreshWatchItem } from '../api/watchlist-api'
import Auth from '../auth/Auth'
import { UserInfoItem } from '../types/UserInfoItem'
import { UpdateUserInfoRequest } from '../types/UpdateUserInfoRequest'
import { WatchItem } from '../types/WatchItem'

interface WatchListProps {
  auth: Auth
  history: History
}

interface WatchListState {
  userInfo: UserInfoItem
  watchItems: WatchItem[]
  newTicker: string
  loadingWatchItems: boolean
}

export class WatchList extends React.PureComponent<WatchListProps, WatchListState> {

  defaultAvatarUrl: string = 'https://react.semantic-ui.com/images/wireframe/square-image.png'

  state: WatchListState = {
    userInfo: {},
    watchItems: [],
    newTicker: '',
    loadingWatchItems: true
  }

  handleTickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTicker: event.target.value })
  }

  handleAlertUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`handleAlertUrlChange: ${event.target.value}`)
    const updatedValue: UserInfoItem = {
      email: (event.target.value) ? event.target.value : undefined,
      avatarUrl: this.state.userInfo.avatarUrl
    }
    this.setState({ userInfo: updatedValue })
  }

  onEditWatchItemButtonClick = (watchId: string) => {
    this.props.history.push(`/watchlist/${watchId}/edit`)
  }

  onAvatarImageButtonClick = () => {
    this.props.history.push("/userinfo/edit")
  }

  onWatchListRefresh = async () => {
    try {
      const idToken = this.props.auth.getIdToken()
      
      let refreshedItems: WatchItem[] = []
      for (const item of this.state.watchItems) {
        refreshedItems.push(await refreshWatchItem(idToken, item.watchId))        
      }

      this.setState({
        watchItems: refreshedItems
      })

    } catch (e) {
      alert(`Watch list refresh failed: ${e.message}`)
    }
  }

  onWatchItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newWatchItem = await createWatchItem(this.props.auth.getIdToken(), {
        ticker: this.state.newTicker
      })
      this.setState({
        watchItems: [...this.state.watchItems, newWatchItem]
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

  onUpdateAlertUrl = async (event: React.ChangeEvent<HTMLButtonElement>) => {

    const updateUserInfoRequest: UpdateUserInfoRequest = {
      ...this.state.userInfo
    }

    try {
      const updatedItem = await updateUserInfo(this.props.auth.getIdToken(), updateUserInfoRequest)
      console.log(`Update user info: ${JSON.stringify(updatedItem)}`)
      alert('Alert email address updated')
    } catch (e) {
      alert(` Alert email address update failed ${e.message} `)
    }
  }

  async componentDidMount() {
    console.log("In componentDidMount...")
    try {
      const token = this.props.auth.getIdToken()
      const userInfo = await getUserInfo(token)
      const watchItems = await getWatchItems(token)
      this.setState({
        userInfo: userInfo,
        watchItems: watchItems,
        loadingWatchItems: false
      })
    } catch (e) {
      alert(`Failed to fetch required data: ${e.message}`)
    }
    console.log(`... userInfo is ${JSON.stringify(this.state.userInfo)}`)
  }

  render() {
    console.log("In render...")
    return (
      <div>
        <Header as="h1">My Watchlist</Header>

        <Image
          onClick={()=>{ this.onAvatarImageButtonClick() }}
          src={ (this.state.userInfo.avatarUrl) ? this.state.userInfo.avatarUrl : this.defaultAvatarUrl }
          size="tiny"
          circular
          verticalAlign='bottom'>
        </Image>

        <Divider/>

        <Grid centered padded>
          <Grid.Row centered>

            <Grid.Column textAlign='center' width={7}>
              {this.renderCreateWatchItemInput()}
            </Grid.Column>

            <Grid.Column textAlign='center' width={7}>
              <Input
              action={{
                color: 'teal',
                labelPosition: 'left',
                icon: 'add',
                content: 'Alert email address',
                onClick: this.onUpdateAlertUrl
              }}
              fluid
              actionPosition="left"
              placeholder={(this.state.userInfo.email) ? this.state.userInfo.email : ''}
              onChange={this.handleAlertUrlChange}/>
            </Grid.Column>

            <Grid.Column textAlign='center' width={2}>
              <Button
                icon
                color="blue"
                onClick={() => { this.onWatchListRefresh() }}>
                <Icon name="refresh" />
              </Button>   
            </Grid.Column>

          </Grid.Row>
        </Grid>

        <Divider/>

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
              <Grid.Column width={3} verticalAlign="middle">
                {watchItem.ticker}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {watchItem.description}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" style={{ color: watchItem.alertTriggered ? "red" : "black" }}>
                {watchItem.price.toFixed(2)}{watchItem.currency} {(watchItem.alertPrice ? `[${watchItem.alertPrice.toFixed(2)}]` : '')}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {watchItem.timeStamp}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditWatchItemButtonClick(watchItem.watchId)}
                >
                  <Icon name="alarm" />
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
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
