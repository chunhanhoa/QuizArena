package com.hutech.quiz.repository;

import com.hutech.quiz.model.CommunityStory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommunityStoryRepository extends MongoRepository<CommunityStory, String> {
    List<CommunityStory> findByStatus(String status);
    List<CommunityStory> findByAuthorId(String authorId);
    List<CommunityStory> findByStatusOrderByLikesDesc(String status);
    List<CommunityStory> findByStatusAndGenre(String status, String genre);
}
