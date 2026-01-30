package com.hutech.quiz.service;

import com.hutech.quiz.model.Quiz.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${groq.api.keys}")
    private String[] apiKeys;

    @Value("${groq.api.url}")
    private String apiUrl;

    private int currentKeyIndex = 0;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<Question> generateQuestions(String topic, int count) {
        String prompt = String.format(
                "Hãy tạo %d câu hỏi trắc nghiệm về chủ đề '%s' hoàn toàn bằng TIẾNG VIỆT (bao gồm cả nội dung câu hỏi, các lựa chọn đáp án và giải thích). "
                        +
                        "Yêu cầu trả về định dạng JSON array chính xác. " +
                        "Cấu trúc: [{ \"content\": \"câu hỏi bằng tiếng Việt\", \"imageUrl\": \"https://placehold.co/600x400?text=Quiz\", \"type\": \"multiple-choice\", \"options\": [{ \"text\": \"đáp án tiếng Việt\", \"isCorrect\": true/false }], \"timeLimit\": 20, \"explanation\": \"giải thích ngắn gọn bằng tiếng Việt\" }]. "
                        +
                        "LƯU Ý QUAN TRỌNG: Tất cả nội dung văn bản (các trường 'content', 'text', 'explanation') BẮT BUỘC phải là tiếng Việt. Cung cấp DUY NHẤT mã JSON array, không kèm theo bất kỳ văn bản giải thích nào khác bên ngoài.",
                count, topic);

        // Thử lần lượt các key nếu có lỗi
        int startKeyIndex = currentKeyIndex;
        for (int i = 0; i < apiKeys.length; i++) {
            int attemptIndex = (startKeyIndex + i) % apiKeys.length;
            String cleanKey = apiKeys[attemptIndex].trim();

            System.out.println("AI Generation Attempt with key index: " + attemptIndex);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + cleanKey);

            Map<String, Object> body = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(
                            Map.of("role", "system", "content",
                                    "Bạn là một chuyên gia tạo câu hỏi trắc nghiệm. Nhiệm vụ của bạn là luôn luôn phản hồi bằng TIẾNG VIỆT chính xác, chuyên nghiệp."),
                            Map.of("role", "user", "content", prompt)),
                    "temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        apiUrl,
                        HttpMethod.POST,
                        entity,
                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                        });

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");

                    content = content.replaceAll("```json", "").replaceAll("```", "").trim();

                    // Lưu lại index key thành công để dùng cho lần sau
                    currentKeyIndex = attemptIndex;
                    return parseJsonToQuestions(content);
                }
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                System.err.println("Groq API Key " + attemptIndex + " failed: " + e.getStatusCode());
                if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                    System.err.println("Switching to next key...");
                    continue; // Thử key tiếp theo
                }
                break; // Lỗi khác (ví dụ: Bad Request) thì dừng luôn
            } catch (Exception e) {
                System.err.println("Unexpected error with Groq API: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return new ArrayList<>();
    }

    private List<Question> parseJsonToQuestions(String jsonContent) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(jsonContent, new com.fasterxml.jackson.core.type.TypeReference<List<Question>>() {
            });
        } catch (Exception e) {
            System.err.println("Error parsing AI JSON: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
