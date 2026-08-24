package com.nur.islamiccompanion.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        TaskEntity::class,
        BookmarkEntity::class,
        NoteEntity::class,
        ReflectionEntity::class,
        ArchiveEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class NurDatabase : RoomDatabase() {
    abstract fun taskDao(): TaskDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun noteDao(): NoteDao
    abstract fun reflectionDao(): ReflectionDao
    abstract fun archiveDao(): ArchiveDao

    companion object {
        @Volatile
        private var INSTANCE: NurDatabase? = null

        fun getDatabase(context: Context): NurDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NurDatabase::class.java,
                    "nur_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
