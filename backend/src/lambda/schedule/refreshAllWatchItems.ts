import { refreshAllWatchItems } from '../../businessLogic/watchItems'

export const handler = async (event: any = {}): Promise<any> => {
  console.log('Processing event: ', event);
  
  console.log('Refreshing all watch items...')
  const refreshedItems = await refreshAllWatchItems()
  console.log(`Refreshed items: ${JSON.stringify(refreshedItems)}`)

  console.log('... completed refresh of all watch items')
}
