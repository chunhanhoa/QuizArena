package com.hutech.quiz.repository;

import com.hutech.quiz.model.GameRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface GameRoomRepository extends MongoRepository<GameRoom, String> {
    Optional<GameRoom> findByPin(String pin);
}
