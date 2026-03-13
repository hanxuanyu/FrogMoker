package com.hxuanyu.frogmoker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA 路由回退：所有非 /api、非静态资源的请求均返回 index.html，
 * 由前端 React Router 接管路由。
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
            "/",
            "/templates",
            "/templates/**"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
