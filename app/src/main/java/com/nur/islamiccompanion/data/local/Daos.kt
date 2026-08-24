package com.nur.islamiccompanion.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY createdAt DESC")
    fun getAllTasks(): Flow<List<TaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity)

    @Update
    suspend fun updateTask(task: TaskEntity)

    @Delete
    suspend fun deleteTask(task: TaskEntity)

    @Query("UPDATE tasks SET completed = :completed WHERE id = :id")
    suspend fun setTaskCompleted(id: String, completed: Boolean)
}

@Dao
interface BookmarkDao {
    @Query("SELECT * FROM quran_bookmarks ORDER BY timestamp DESC")
    fun getAllBookmarks(): Flow<List<BookmarkEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmark(bookmark: BookmarkEntity)

    @Delete
    suspend fun deleteBookmark(bookmark: BookmarkEntity)

    @Query("DELETE FROM quran_bookmarks WHERE surahNumber = :surah AND ayahNumber = :ayah")
    suspend fun deleteBookmarkForAyah(surah: Int, ayah: Int)

    @Query("SELECT EXISTS(SELECT 1 FROM quran_bookmarks WHERE surahNumber = :surah AND ayahNumber = :ayah)")
    suspend fun isBookmarked(surah: Int, ayah: Int): Boolean
}

@Dao
interface NoteDao {
    @Query("SELECT * FROM quran_notes ORDER BY updatedAt DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity)

    @Delete
    suspend fun deleteNote(note: NoteEntity)
}

@Dao
interface ReflectionDao {
    @Query("SELECT * FROM reflections ORDER BY timestamp DESC")
    fun getAllReflections(): Flow<List<ReflectionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReflection(reflection: ReflectionEntity)
}

@Dao
interface ArchiveDao {
    @Query("SELECT * FROM archive_items ORDER BY timestamp DESC")
    fun getAllArchiveItems(): Flow<List<ArchiveEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArchiveItem(item: ArchiveEntity)

    @Delete
    suspend fun deleteArchiveItem(item: ArchiveEntity)
}
