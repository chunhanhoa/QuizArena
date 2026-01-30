package com.hutech.quiz.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({ "/", "/index.html" })
    public String index() {
        return "index";
    }

    @GetMapping({ "/login", "/login.html" })
    public String login() {
        return "login";
    }

    @GetMapping({ "/create", "/create.html" })
    public String create() {
        return "create";
    }

    @GetMapping({ "/game", "/game.html" })
    public String game() {
        return "game";
    }

    @GetMapping({ "/lobby", "/lobby.html" })
    public String lobby() {
        return "lobby";
    }

    @GetMapping({ "/results", "/results.html" })
    public String results() {
        return "results";
    }

    @GetMapping({ "/story", "/story.html" })
    public String story() {
        return "story";
    }
}
