package com.nur.islamiccompanion.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val category: String,
    val priority: String,
    val date: String,
    val time: String,
    val hasReminder: Boolean,
    val repeat: String,
    val completed: Boolean,
    val createdAt: Long
)

@Entity(tableName = "quran_bookmarks")
data class BookmarkEntity(
    @PrimaryKey val id: String,
    val surahNumber: Int,
    val surahName: String,
    val ayahNumber: Int,
    val arabicSnippet: String,
    val translationSnippet: String,
    val timestamp: Long,
    val isFavorite: Boolean
)

@Entity(tableName = "quran_notes")
data class NoteEntity(
    @PrimaryKey val id: String,
    val surahNumber: Int,
    val surahName: String,
    val ayahNumber: Int,
    val noteText: String,
    val updatedAt: Long
)

@Entity(tableName = "reflections")
data class ReflectionEntity(
    @PrimaryKey val id: String,
    val date: String,
    val mood: String,
    val prayerStatus: String,
    val quranMinutes: Int,
    val gratitudeNotesJson: String,
    val improvementsTomorrowJson: String,
    val journalText: String,
    val timestamp: Long
)

@Entity(tableName = "archive_items")
data class ArchiveEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val content: String,
    val arabicContent: String?,
    val tagsJson: String,
    val date: String,
    val timestamp: Long
)
