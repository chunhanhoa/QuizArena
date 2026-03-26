package com.hutech.quiz.controller;

import com.hutech.quiz.model.CommunityStory;
import com.hutech.quiz.repository.CommunityStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stories/community")
@RequiredArgsConstructor
public class CommunityStoryController {

    private final CommunityStoryRepository storyRepository;

    // GET all published stories, optionally filtered by genre
    @GetMapping
    public ResponseEntity<List<CommunityStory>> getPublishedStories(
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "false") boolean sortByLikes) {

        List<CommunityStory> stories;
        if (genre != null && !genre.isEmpty()) {
            stories = storyRepository.findByStatusAndGenre("PUBLISHED", genre);
        } else if (sortByLikes) {
            stories = storyRepository.findByStatusOrderByLikesDesc("PUBLISHED");
        } else {
            stories = storyRepository.findByStatus("PUBLISHED");
        }
        return ResponseEntity.ok(stories);
    }

    // GET stories by current author
    @GetMapping("/mine")
    public ResponseEntity<List<CommunityStory>> getMyStories(@RequestParam String authorId) {
        return ResponseEntity.ok(storyRepository.findByAuthorId(authorId));
    }

    // GET single story by id
    @GetMapping("/{id}")
    public ResponseEntity<CommunityStory> getStoryById(@PathVariable String id) {
        return storyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new story (saved as DRAFT)
    @PostMapping
    public ResponseEntity<?> createStory(@RequestBody CommunityStory story) {
        if (story == null) {
            return ResponseEntity.badRequest().body("Story body is null");
        }
        if (story.getTitle() == null || story.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body("Title is required");
        }
        story.setId(null); // ensure new document
        story.setStatus("DRAFT");
        story.setLikes(0);
        story.setPlays(0);
        story.setCreatedAt(new Date());
        story.setUpdatedAt(new Date());
        CommunityStory saved = storyRepository.save(story);
        return ResponseEntity.ok(saved);
    }

    // PUT update story (author only - basic check by authorId)
    @PutMapping("/{id}")
    public ResponseEntity<CommunityStory> updateStory(@PathVariable String id,
                                                       @RequestBody CommunityStory updated) {
        Optional<CommunityStory> opt = storyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CommunityStory existing = opt.get();
        // Only allow author to update, and only if not already PUBLISHED
        if (!existing.getAuthorId().equals(updated.getAuthorId())) {
            return ResponseEntity.status(403).build();
        }

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setGenre(updated.getGenre());
        existing.setThumbnail(updated.getThumbnail());
        existing.setNodes(updated.getNodes());
        existing.setUpdatedAt(new Date());
        return ResponseEntity.ok(storyRepository.save(existing));
    }

    // POST submit story for review (DRAFT → PUBLISHED for now, can add moderation later)
    @PostMapping("/{id}/publish")
    public ResponseEntity<CommunityStory> publishStory(@PathVariable String id,
                                                         @RequestParam String authorId) {
        Optional<CommunityStory> opt = storyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CommunityStory story = opt.get();
        if (!story.getAuthorId().equals(authorId)) {
            return ResponseEntity.status(403).build();
        }
        if (story.getNodes() == null || story.getNodes().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        story.setStatus("PUBLISHED");
        story.setUpdatedAt(new Date());
        return ResponseEntity.ok(storyRepository.save(story));
    }

    // POST like a story
    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Integer>> likeStory(@PathVariable String id) {
        Optional<CommunityStory> opt = storyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CommunityStory story = opt.get();
        story.setLikes(story.getLikes() + 1);
        storyRepository.save(story);
        return ResponseEntity.ok(Map.of("likes", story.getLikes()));
    }

    // POST increment play count
    @PostMapping("/{id}/play")
    public ResponseEntity<Map<String, Integer>> recordPlay(@PathVariable String id) {
        Optional<CommunityStory> opt = storyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CommunityStory story = opt.get();
        story.setPlays(story.getPlays() + 1);
        storyRepository.save(story);
        return ResponseEntity.ok(Map.of("plays", story.getPlays()));
    }

    // DELETE story
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable String id,
                                             @RequestParam String authorId) {
        Optional<CommunityStory> opt = storyRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CommunityStory story = opt.get();
        if (!story.getAuthorId().equals(authorId)) {
            return ResponseEntity.status(403).build();
        }
        storyRepository.delete(story);
        return ResponseEntity.ok().build();
    }
}
