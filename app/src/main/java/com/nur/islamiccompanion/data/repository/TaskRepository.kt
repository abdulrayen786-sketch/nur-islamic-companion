package com.nur.islamiccompanion.data.repository

import com.nur.islamiccompanion.data.local.NurDatabase
import com.nur.islamiccompanion.data.local.TaskEntity
import com.nur.islamiccompanion.data.model.Task
import com.nur.islamiccompanion.data.model.TaskPriority
import com.nur.islamiccompanion.data.model.TaskRepeat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class TaskRepository(private val database: NurDatabase) {

    val allTasksFlow: Flow<List<Task>> = database.taskDao().getAllTasks().map { entities ->
        entities.map { entity ->
            Task(
                id = entity.id,
                name = entity.name,
                description = entity.description,
                category = entity.category,
                priority = try { TaskPriority.valueOf(entity.priority) } catch (_: Exception) { TaskPriority.MEDIUM },
                date = entity.date,
                time = entity.time,
                hasReminder = entity.hasReminder,
                repeat = try { TaskRepeat.valueOf(entity.repeat) } catch (_: Exception) { TaskRepeat.DAILY },
                completed = entity.completed,
                createdAt = entity.createdAt
            )
        }
    }

    suspend fun insertTask(task: Task) {
        val entity = TaskEntity(
            id = task.id,
            name = task.name,
            description = task.description,
            category = task.category,
            priority = task.priority.name,
            date = task.date,
            time = task.time,
            hasReminder = task.hasReminder,
            repeat = task.repeat.name,
            completed = task.completed,
            createdAt = task.createdAt
        )
        database.taskDao().insertTask(entity)
    }

    suspend fun toggleTaskCompleted(taskId: String, isCompleted: Boolean) {
        database.taskDao().setTaskCompleted(taskId, isCompleted)
    }

    suspend fun deleteTask(task: Task) {
        val entity = TaskEntity(
            id = task.id,
            name = task.name,
            description = task.description,
            category = task.category,
            priority = task.priority.name,
            date = task.date,
            time = task.time,
            hasReminder = task.hasReminder,
            repeat = task.repeat.name,
            completed = task.completed,
            createdAt = task.createdAt
        )
        database.taskDao().deleteTask(entity)
    }
}
