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

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

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

                // Clean content if AI includes markdown code blocks
                content = content.replaceAll("```json", "").replaceAll("```", "").trim();

                return parseJsonToQuestions(content);
            }
        } catch (Exception e) {
            System.err.println("Error calling Groq API: " + e.getMessage());
            e.printStackTrace();
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
