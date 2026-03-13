package com.hutech.quiz.service;

import com.hutech.quiz.model.GameRoom;
import com.hutech.quiz.repository.GameRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameRoomCleanupService {

    private final GameRoomRepository gameRoomRepository;

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void cleanupOldRooms() {
        log.info("Starting cleanup of inactive game rooms...");
        long fifteenMinutesAgo = System.currentTimeMillis() - (15 * 60 * 1000);
        Date cutoffDate = new Date(fifteenMinutesAgo);

        List<GameRoom> allRooms = gameRoomRepository.findAll();
        int deletedCount = 0;

        for (GameRoom room : allRooms) {
            // If the room has no lastActiveAt (legacy), or it's older than 15 minutes
            if (room.getLastActiveAt() == null || room.getLastActiveAt().before(cutoffDate)) {
                // We keep rooms that are currently STARTED and were active recently, 
                // but if a room is WAITING or FINISHED and inactive, we delete it.
                // Actually, the requirement is "if NOT USED for more than 15 mins", 
                // so if lastActiveAt is old, we delete it regardless of status.
                gameRoomRepository.delete(room);
                deletedCount++;
                log.info("Deleted inactive room with PIN: {}", room.getPin());
            }
        }

        if (deletedCount > 0) {
            log.info("Cleanup finished. Deleted {} inactive rooms.", deletedCount);
        } else {
            log.info("Cleanup finished. No inactive rooms found.");
        }
    }
}
