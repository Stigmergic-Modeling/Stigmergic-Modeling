/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.system.User;
import net.stigmod.service.SessionService;
import net.stigmod.service.migrateService.MigrateService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import net.stigmod.repository.node.UserRepository;

/**
 * Handle StigMod base requests
 *
 * @version     2015/08/04
 * @author 	    Shijun Wang
 */
@Controller
public class StigModController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    @Autowired
    UserRepository userRepository;

    @Autowired
    MigrateService migrateService;

    @Autowired
    SessionService sessionService;

    private final static Logger logger = LoggerFactory.getLogger(StigModController.class);

    // front page
    @RequestMapping(value="/", method = RequestMethod.GET)
    public String index(ModelMap model) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "index");
        return "index";
    }

    // about this web app
    @RequestMapping(value="/about", method = RequestMethod.GET)
    public String about(ModelMap model) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

        final User user = userRepository.getUserFromSession();
        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "about");
        return "about";
    }

    // about this web app
    @RequestMapping(value="/testFusion/{ccmId}", method = RequestMethod.GET)
    @ResponseBody
    public long testFusion(@PathVariable("ccmId") Long ccmId) {
//        migrateService.migrateAlgorithmImpls(ccmId);
        return sessionService.getOnlineUserNumber();
//        return "Fusion Finished";
    }

    // favicon
    @RequestMapping("/favicon.ico")
    public String favicon() {
        return "forward:/static/dist/img/favicon.ico";
    }

}