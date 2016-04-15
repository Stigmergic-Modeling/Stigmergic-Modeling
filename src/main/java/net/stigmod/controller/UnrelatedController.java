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
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
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
    public String reg(ModelMap model) {

        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "AHP");

        return "unrelated/ahp_scoring";
    }

}
