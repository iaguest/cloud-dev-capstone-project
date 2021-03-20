import { apiEndpoint } from '../config'
import { WatchItem } from '../types/WatchItem';
import { CreateWatchItemRequest } from '../types/CreateWatchItemRequest';
import Axios from 'axios'
import { UpdateWatchItemRequest } from '../types/UpdateWatchItemRequest';
import { watch } from 'fs';

export async function getWatchItems(idToken: string): Promise<WatchItem[]> {
  console.log('Fetching watch items...')

  const response = await Axios.get(`${apiEndpoint}/watchlist`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('watch items:', response.data)
  return response.data.items
}

export async function createWatchItem(
  idToken: string,
  createWatchItemRequest: CreateWatchItemRequest
): Promise<WatchItem> {
  console.log("In createWatchItem...")

  const response = await Axios.post(`${apiEndpoint}/watchlist`, JSON.stringify(createWatchItemRequest), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  const item = response.data.item
  console.log(`... response item is ${JSON.stringify(item)}, exiting createWatchItem`)
  return item
}

export async function patchWatchItem(
  idToken: string,
  watchId: string,
  updateWatchItemRequest: UpdateWatchItemRequest
): Promise<WatchItem> {
  
  const replacer = (key:any, value:any) =>
    typeof value === 'undefined' ? null : value;
  
  const response = await Axios.patch(`${apiEndpoint}/watchlist/${watchId}`, JSON.stringify(updateWatchItemRequest, replacer), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  const item = response.data.item
  console.log(`... response item is ${JSON.stringify(item)}, exiting patchWatchItem`)
  return item
}

export async function refreshWatchItem(
  idToken: string,
  watchId: string
): Promise<WatchItem> {

  console.log(`Calling refresh watch item with id token ${idToken} and watchId ${watchId}...`)

  const response = await Axios.post(`${apiEndpoint}/watchlist/${watchId}/refresh`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  const item = response.data.item
  console.log(`response item is: ${JSON.stringify(item)}`)
  console.log("... Exiting refreshWatchItem")
  return item
}

export async function deleteWatchItem(
  idToken: string,
  watchId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/watchlist/${watchId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
