/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * 用于实验中 AHP 评分的页面路由
 *
 * @author Shijun Wang
 * @version 2016/4/14
 */
@Controller
public class UnrelatedController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    // ahp_scoring page GET
    @RequestMapping(value="/ahp", method = RequestMethod.GET)
    public String ahp(ModelMap model, HttpServletRequest request) {

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "AHP");

        List<String> leftModels = Arrays.asList("1.png", "3.png", "5.png");
        List<String> rightModels = Arrays.asList("2.png", "4.png", "6.png");

        model.addAttribute("leftModels", leftModels);
        model.addAttribute("rightModels", rightModels);

        return "unrelated/ahp_scoring";
    }

    // ahp_scoring page POST
    @RequestMapping(value="/ahp", method = RequestMethod.POST)
    @ResponseBody
    public String getScore(@RequestBody String data) {

        System.out.println(data);
        return "good";
    }

}
