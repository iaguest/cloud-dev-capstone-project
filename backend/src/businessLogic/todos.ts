import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { DbAccess } from '../dataLayer/dbAccess'
import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const dbAccess = new DbAccess()

export async function getAllTodos(
  userId: string
) : Promise<TodoItem[]> {
  return dbAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
) : Promise<TodoItem> {
  return await dbAccess.createTodoItem({
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
  const toDoUpdate : TodoUpdate = {
    ...updateTodoRequest,
  }

  const currentTodoItem: TodoItem = await dbAccess.getTodo(userId, todoId)

  await dbAccess.updateTodoItem(toDoUpdate, userId, currentTodoItem.createdAt)
}

export async function setTodoItemAttachmentUrl(
  userId: string,
  todoId: string,
  url: string
) {
  const currentTodoItem: TodoItem = await dbAccess.getTodo(userId, todoId)
  
  await dbAccess.setTodoItemAttachmentUrl(userId, currentTodoItem.createdAt, url)
}

export async function deleteTodo(
  userId: string,
  todoId:string
) {
  const currentTodoItem: TodoItem = await dbAccess.getTodo(userId, todoId)

  if (currentTodoItem.attachmentUrl !== undefined) {
    await deleteTodoItemAttachment(todoId)
  }

  await dbAccess.deleteToDoItem(userId, currentTodoItem.createdAt)
}