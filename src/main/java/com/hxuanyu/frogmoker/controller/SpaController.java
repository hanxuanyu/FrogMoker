package com.hxuanyu.frogmoker.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
public class SpaController {

    @RequestMapping(value = {
            "/",
            "/templates",
            "/templates/**"
    })
    public String spa() {
        log.debug("Forwarding SPA route to index.html.");
        return "forward:/index.html";
    }
}
