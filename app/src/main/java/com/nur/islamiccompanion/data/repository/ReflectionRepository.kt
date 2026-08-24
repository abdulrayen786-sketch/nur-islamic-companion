package com.nur.islamiccompanion.data.repository

import com.nur.islamiccompanion.data.local.ArchiveEntity
import com.nur.islamiccompanion.data.local.NurDatabase
import com.nur.islamiccompanion.data.local.ReflectionEntity
import com.nur.islamiccompanion.data.model.ArchiveItem
import com.nur.islamiccompanion.data.model.Reflection
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class ReflectionRepository(private val database: NurDatabase) {

    val allReflectionsFlow: Flow<List<Reflection>> = database.reflectionDao().getAllReflections().map { list ->
        list.map { entity ->
            Reflection(
                id = entity.id,
                date = entity.date,
                mood = entity.mood,
                prayerStatus = entity.prayerStatus,
                quranMinutes = entity.quranMinutes,
                gratitudeNotes = entity.gratitudeNotesJson.split(";;").filter { it.isNotEmpty() },
                improvementsTomorrow = entity.improvementsTomorrowJson.split(";;").filter { it.isNotEmpty() },
                journalText = entity.journalText,
                timestamp = entity.timestamp
            )
        }
    }

    suspend fun saveReflection(reflection: Reflection) {
        val entity = ReflectionEntity(
            id = reflection.id,
            date = reflection.date,
            mood = reflection.mood,
            prayerStatus = reflection.prayerStatus,
            quranMinutes = reflection.quranMinutes,
            gratitudeNotesJson = reflection.gratitudeNotes.joinToString(";;"),
            improvementsTomorrowJson = reflection.improvementsTomorrow.joinToString(";;"),
            journalText = reflection.journalText,
            timestamp = reflection.timestamp
        )
        database.reflectionDao().insertReflection(entity)
    }
}

class ArchiveRepository(private val database: NurDatabase) {

    val allArchiveItemsFlow: Flow<List<ArchiveItem>> = database.archiveDao().getAllArchiveItems().map { list ->
        list.map { entity ->
            ArchiveItem(
                id = entity.id,
                title = entity.title,
                category = entity.category,
                content = entity.content,
                arabicContent = entity.arabicContent,
                tags = entity.tagsJson.split(",").filter { it.isNotEmpty() },
                date = entity.date,
                timestamp = entity.timestamp
            )
        }
    }

    suspend fun insertArchiveItem(item: ArchiveItem) {
        val entity = ArchiveEntity(
            id = item.id,
            title = item.title,
            category = item.category,
            content = item.content,
            arabicContent = item.arabicContent,
            tagsJson = item.tags.joinToString(","),
            date = item.date,
            timestamp = item.timestamp
        )
        database.archiveDao().insertArchiveItem(entity)
    }

    fun getAsmaUlHusna(): List<ArchiveItem> = listOf(
        ArchiveItem("name1", "Ar-Rahman (الرَّحْمَٰنُ)", "99 Names of Allah", "The Entirely Merciful, who encompasses all creation in mercy.", "الرَّحْمَٰنُ", listOf("Mercy", "Divine Names")),
        ArchiveItem("name2", "Ar-Raheem (الرَّحِيمُ)", "99 Names of Allah", "The Especially Merciful to the believers.", "الرَّحِيمُ", listOf("Mercy", "Divine Names")),
        ArchiveItem("name3", "Al-Malik (الْمَلِكُ)", "99 Names of Allah", "The Sovereign Lord, the Absolute Ruler of the Universe.", "الْمَلِكُ", listOf("Sovereignty", "Divine Names")),
        ArchiveItem("name4", "Al-Quddus (الْقُدُّوسُ)", "99 Names of Allah", "The Most Sacred, free from all deficiency.", "الْقُدُّوسُ", listOf("Purity", "Divine Names")),
        ArchiveItem("name5", "As-Salam (السَّلَامُ)", "99 Names of Allah", "The Source of Peace and Perfection.", "السَّلَامُ", listOf("Peace", "Divine Names")),
        ArchiveItem("name6", "An-Nur (النُّورُ)", "99 Names of Allah", "The Light, who illuminates the heavens and the earth.", "النُّورُ", listOf("Light", "Divine Names"))
    )

    fun getFortyHadith(): List<ArchiveItem> = listOf(
        ArchiveItem("h1", "Hadith 1: Actions are by Intentions", "40 Hadith An-Nawawi", "Actions are judged by motives, so each man will have what he intended.", "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", listOf("Hadith", "Ethics"), "Sahih al-Bukhari 1"),
        ArchiveItem("h2", "Hadith 2: Islam, Iman, Ihsan (Hadith Jibril)", "40 Hadith An-Nawawi", "Ihsan is to worship Allah as though you see Him; and if you see Him not, yet truly He sees you.", "أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ", listOf("Hadith", "Pillars"), "Sahih Muslim 8")
    )
}
