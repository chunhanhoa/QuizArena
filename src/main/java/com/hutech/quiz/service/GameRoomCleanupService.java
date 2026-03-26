package com.hutech.quiz.service;

import com.hutech.quiz.model.GameRoom;
import com.hutech.quiz.repository.GameRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP SERVICE: TỰ ĐỘNG DỌN PHÒNG RÁC
//
// Xử lý tình huống: Host tắt trình duyệt hoặc toàn bộ người chơi mất kết nối
// mà không bấm thoát → phòng game sẽ lơ lửng trong DB mãi mãi.
//
// Giải pháp: Service này chạy định kỳ mỗi 5 phút, xóa các phòng không có
// hoạt động trong 15 phút trở lên (dựa trên trường lastActiveAt).
// lastActiveAt được cập nhật mỗi khi có action: join, start, answer, freeze...
// ─────────────────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Slf4j
public class GameRoomCleanupService {

    private final GameRoomRepository gameRoomRepository;

    // Chạy tự động mỗi 5 phút (300,000 ms)
    @Scheduled(fixedRate = 300000)
    public void cleanupOldRooms() {
        log.info("Starting cleanup of inactive game rooms...");

        // Ngưỡng thời gian: phòng không hoạt động quá 15 phút sẽ bị xóa
        long fifteenMinutesAgo = System.currentTimeMillis() - (15 * 60 * 1000);
        Date cutoffDate = new Date(fifteenMinutesAgo);

        List<GameRoom> allRooms = gameRoomRepository.findAll();
        int deletedCount = 0;

        for (GameRoom room : allRooms) {
            // Xóa phòng nếu: chưa có lastActiveAt (phòng cũ/legacy) HOẶC đã quá 15 phút không hoạt động
            // Áp dụng cho mọi trạng thái: WAITING (chưa ai join), STARTED (đang chơi nhưng bị ngắt),
            // hay FINISHED (đã xong nhưng không có ai dọn)
            if (room.getLastActiveAt() == null || room.getLastActiveAt().before(cutoffDate)) {
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
