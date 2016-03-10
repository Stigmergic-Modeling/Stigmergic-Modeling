/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.info.IcmDetail;
import net.stigmod.domain.system.IndividualConceptualModel;
import net.stigmod.domain.system.User;
//import net.stigmod.repository.MovieRepository;
import net.stigmod.domain.page.NewModelPageData;
import net.stigmod.domain.page.PageData;
import net.stigmod.domain.page.UserPageData;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;

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

        PageData pageData = new UserPageData(modelService.getAllIcmsOfUser(user));

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("data", pageData.toJsonString());
        model.addAttribute("title", "User");
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
            return "redirect:/" + name + "/workspace";

        } catch(Exception e) {
            logger.info("createIcmClean fail");
            e.printStackTrace();
            model.addAttribute("error", e.getMessage());
            model.addAttribute("title", "New Model");
            model.addAttribute("user", user);
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            return "new_model";
        }
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
            return "redirect:/" + name + "/workspace";

        } catch(Exception e) {
            logger.info("createIcmInherited fail");
            e.printStackTrace();
            model.addAttribute("error", e.getMessage());
            model.addAttribute("title", "New Model");
            model.addAttribute("user", user);
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            return "new_model";
        }
    }

    // GET 用户设置 profile 页面
    @RequestMapping(value = "/user/settings/profile", method = RequestMethod.GET)
    public String settings(ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Profile Settings");
        return "user_settings";
    }

    // GET 用户设置 account 页面
    @RequestMapping(value = "/user/settings/account", method = RequestMethod.GET)
    public String settingsAccount(ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Account Settings");
        return "user_settings_account";
    }

    // GET 用户设置 model 页面
    @RequestMapping(value = "/user/settings/model", method = RequestMethod.GET)
    public String settingsModel(ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Model Settings");

        try {
            Set<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model";
    }

    // GET 用户设置 model specific 页面
    @RequestMapping(value = "/user/settings/model/{icmName}", method = RequestMethod.GET)
    public String settingsModelSpecific(@PathVariable String icmName, ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Specific Model Settings");

        try {
            IndividualConceptualModel currentIcm = modelService.getIcmOfUserByName(user, icmName);
            Set<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("currentIcm", currentIcm);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model_specific";
    }
}

