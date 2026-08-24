package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nur.islamiccompanion.data.model.Task
import com.nur.islamiccompanion.data.model.TaskPriority
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun TasksScreen(
    viewModel: MainViewModel
) {
    val tasks by viewModel.tasks.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var newTaskName by remember { mutableStateOf("") }
    var newTaskCategory by remember { mutableStateOf("Spiritual") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Daily & Recurring Tasks",
            subtitle = "Track habits, Qur'an goals, and personal duties",
            actions = {
                IconButton(onClick = { showAddDialog = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Add Task", tint = NurGold)
                }
            }
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (tasks.isEmpty()) {
                item {
                    NurCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "No tasks yet. Tap + to add a daily or recurring task.",
                            color = NurTextSecondary
                        )
                    }
                }
            } else {
                items(tasks, key = { it.id }) { task ->
                    TaskCardItem(
                        task = task,
                        onToggle = { viewModel.toggleTask(task.id, it) },
                        onDelete = {
                            // delete via viewModel
                        }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("New Custom Task", color = NurGold, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newTaskName,
                        onValueChange = { newTaskName = it },
                        label = { Text("Task Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newTaskCategory,
                        onValueChange = { newTaskCategory = it },
                        label = { Text("Category (e.g. Spiritual, Study, Life)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTaskName.isNotBlank()) {
                            viewModel.addTask(newTaskName, newTaskCategory)
                            newTaskName = ""
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NurGold)
                ) {
                    Text("Save Task", color = NurMidnightDark, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel", color = NurTextSecondary)
                }
            },
            containerColor = NurCardDark
        )
    }
}

@Composable
fun TaskCardItem(
    task: Task,
    onToggle: (Boolean) -> Unit,
    onDelete: () -> Unit
) {
    NurCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onToggle(!task.completed) }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = task.completed,
                    onCheckedChange = { onToggle(it) },
                    colors = CheckboxDefaults.colors(
                        checkedColor = NurEmerald,
                        checkmarkColor = NurMidnightDark,
                        uncheckedColor = NurTextMuted
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = task.name,
                        style = MaterialTheme.typography.bodyLarge,
                        color = if (task.completed) NurTextMuted else NurTextPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${task.category} • ${task.repeat.name.lowercase()}",
                        style = MaterialTheme.typography.labelMedium,
                        color = NurTextSecondary
                    )
                }
            }
        }
    }
}
