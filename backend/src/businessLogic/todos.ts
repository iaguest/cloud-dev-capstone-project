import * as uuid from 'uuid'

import { WatchItem } from '../models/WatchItem'
import { WatchItemUpdate } from '../models/WatchItemUpdate'
import { DbAccess } from '../dataLayer/dbAccess'
import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const dbAccess = new DbAccess()

export async function getAllTodos(
  userId: string
) : Promise<WatchItem[]> {
  return dbAccess.getAllWatchItems(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
) : Promise<WatchItem> {
  return await dbAccess.createWatchItem({
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: undefined
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
) {
  const toDoUpdate : WatchItemUpdate = {
    ...updateTodoRequest,
  }

  const currentTodoItem: WatchItem = await dbAccess.getWatchItem(userId, todoId)

  await dbAccess.updateWatchItem(toDoUpdate, userId, currentTodoItem.createdAt)
}

// export async function setTodoItemAttachmentUrl(
//   userId: string,
//   todoId: string,
//   url: string
// ) {
//   const currentTodoItem: WatchItem = await dbAccess.getWatchItem(userId, todoId)
  
//   await dbAccess.setTodoItemAttachmentUrl(userId, currentTodoItem.createdAt, url)
// }

export async function deleteTodo(
  userId: string,
  todoId:string
) {
  const currentTodoItem: WatchItem = await dbAccess.getWatchItem(userId, todoId)

  if (currentTodoItem.attachmentUrl !== undefined) {
    await deleteTodoItemAttachment(todoId)
  }

  await dbAccess.deleteWatchItem(userId, currentTodoItem.createdAt)
}