/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.node.CollectiveConceptualModel;
import net.stigmod.domain.node.User;
//import net.stigmod.repository.MovieRepository;
import net.stigmod.domain.page.NewModelPageData;
import net.stigmod.domain.page.PageData;
import net.stigmod.repository.node.UserRepository;
import net.stigmod.service.ModelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;

/**
 * Handle user related page requests
 *
 * @version     2016/02/02
 * @author 	    Shijun Wang
 */
@Controller
public class UserController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    @Autowired
    UserRepository userRepository;

    @Autowired
    ModelService modelService;

    private final static Logger logger = LoggerFactory.getLogger(UserController.class);

    // GET 用户主页面（模型列表）
    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public String profile(ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "user");
        return "user";
    }

    // GET 新建模型的页面
    @RequestMapping(value = "/newmodel", method = RequestMethod.GET)
    public String newModel(ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        PageData pageData = new NewModelPageData(modelService.getAllCcms());
//        logger.debug(pageData.toString());

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("data", pageData.toJsonString());
        model.addAttribute("title", "New Model");
        return "new_model";
    }

    // POST 新建模型（全新新建方式）
    @RequestMapping(value = "/newmodel/clean", method = RequestMethod.POST)
    public String doNewModelClean(@RequestParam(value = "name") String name,
                                      @RequestParam(value = "description") String description,
                                      ModelMap model) {
        final User user = userRepository.getUserFromSession();

        try {
            modelService.createIcmClean(user, name, description);
            model.addAttribute("success", "Create new model successfully.");

        } catch(Exception e) {
            logger.info("createIcmClean fail");
            model.addAttribute("error", e.getMessage());
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "New Model");

        return "new_model";
    }

    // POST 新建模型（继承新建方式）
    @RequestMapping(value = "/newmodel/inherited", method = RequestMethod.POST)
    public String doNewModelInherited(@RequestParam(value = "name") String name,
                                      @RequestParam(value = "description") String description,
                                      @RequestParam(value = "id") Long ccmId,
                                      ModelMap model) {
        final User user = userRepository.getUserFromSession();

        try {
            modelService.createIcmInherited(user, name, description, ccmId);
            model.addAttribute("success", "Create new model successfully.");

        } catch(Exception e) {
            logger.info("createIcmInherited fail");
            model.addAttribute("error", e.getMessage());
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "New Model");

        return "new_model";
    }


    private String cvtObj2Json (Object obj) {
        return "ok";
    }
}

