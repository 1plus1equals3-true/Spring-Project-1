package com.youngjin.mcl_project.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @Value("${frontend.base-url}")
    private String FRONT_URL;

    @GetMapping("/")
    public String index() {
        return "redirect:" + FRONT_URL;
    }
}
