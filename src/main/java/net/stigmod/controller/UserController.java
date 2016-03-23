/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import com.sun.istack.internal.NotNull;
import net.stigmod.domain.info.IcmDetail;
import net.stigmod.domain.system.IndividualConceptualModel;
import net.stigmod.domain.system.User;
import net.stigmod.domain.page.NewModelPageData;
import net.stigmod.domain.page.PageData;
import net.stigmod.domain.page.UserPageData;
import net.stigmod.repository.node.UserRepository;
import net.stigmod.service.ModelService;
import net.stigmod.service.migrateService.MigrateService;
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
import java.util.List;
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

    @Autowired
    MigrateService migrateService;

    private final static Logger logger = LoggerFactory.getLogger(UserController.class);

    // GET 用户主页面（模型列表）
    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public String profile(ModelMap model, HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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
    public String doNewModelClean(@RequestParam(value = "name") String name,  // 该名称不能与用户已存在 ICM 重名
                                  @RequestParam(value = "description") String descriptionISO,
                                  @RequestParam(value = "language") String languageISO,
                                  ModelMap model) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

        final User user = userRepository.getUserFromSession();

        try {
            String description = new String(descriptionISO.getBytes("ISO-8859-1"), "UTF-8");
            String language = new String(languageISO.getBytes("ISO-8859-1"), "UTF-8");
            String languageDB = language.equals("中文") ? "ZH" : "EN";

            try {
                modelService.createIcmClean(user, name, description, languageDB);
                return "redirect:/" + name + "/workspace";

            } catch (IllegalArgumentException ie) {  // 重名
                model.addAttribute("error", "Model creation failed. (Error: " + ie.getMessage() + " )");
            }  catch(Exception e) {
                e.printStackTrace();
                model.addAttribute("error", "Model creation failed. (Error: " + e.getMessage() + " )");
            }

            model.addAttribute("languageClean", language);
            model.addAttribute("descriptionClean", description);

        } catch (Exception e) {  // 处理转码可能造成的异常
            e.printStackTrace();
            model.addAttribute("error", "Model creation failed. (Error: " + e.getMessage() + " )");
        }

        PageData pageData = new NewModelPageData(modelService.getAllCcms());
        model.addAttribute("data", pageData.toJsonString());
        model.addAttribute("title", "New Model");
        model.addAttribute("nameClean", name);
        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        return "new_model";
    }

    // POST 新建模型（继承新建方式）
    @RequestMapping(value = "/newmodel/inherited", method = RequestMethod.POST)
    public String doNewModelInherited(@RequestParam(value = "name") String name,  // 该名称不能与用户已存在 ICM 重名
                                      @RequestParam(value = "description") String descriptionISO,
                                      @RequestParam(value = "id") Long ccmId,
                                      @RequestParam(value = "language") String languageISO,
                                      ModelMap model) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

        final User user = userRepository.getUserFromSession();

        try {
            String description = new String(descriptionISO.getBytes("ISO-8859-1"), "UTF-8");
            String language = new String(languageISO.getBytes("ISO-8859-1"), "UTF-8");
            String languageDB = language.equals("中文") ? "ZH" : "EN";

            try {
                modelService.createIcmInherited(user, name, description, ccmId, languageDB);
                return "redirect:/" + name + "/workspace";

            } catch (IllegalArgumentException ie) {  // 重名
                model.addAttribute("error", "Model creation failed. (Error: " + ie.getMessage() + " )");
            }  catch(Exception e) {
                e.printStackTrace();
                model.addAttribute("error", "Model creation failed. (Error: " + e.getMessage() + " )");
            }

            model.addAttribute("languageInherited", language);
            model.addAttribute("descriptionInherited", description);

        } catch (Exception e) {  // 处理转码可能造成的异常
            e.printStackTrace();
            model.addAttribute("error", "Model creation failed. (Error: " + e.getMessage() + " )");
        }

        PageData pageData = new NewModelPageData(modelService.getAllCcms());
        model.addAttribute("data", pageData.toJsonString());
        model.addAttribute("title", "New Model");
        model.addAttribute("nameInherited", name);
        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        return "new_model";
    }

    // GET 用户设置 profile 页面
    @RequestMapping(value = "/user/settings/profile", method = RequestMethod.GET)
    public String settingsProfile(ModelMap model, HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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

    // POST 用户设置 profile 页面
    @RequestMapping(value = "/user/settings/profile", method = RequestMethod.POST)
    public String settingsProfileGo(@RequestParam(value = "name") String name,
                                    @RequestParam(value = "location") String location,
                                    @RequestParam(value = "url") String url,
                                    ModelMap model,
                                    HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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

        try {
            userRepository.updateUserInfo(user.getMail(), name, location, url);
            model.addAttribute("success", "User profile updated successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "User profile updating failed. (Error: " + e.getMessage() + " )");
        }

        return "user_settings";
    }

    // GET 用户设置 account 页面
    @RequestMapping(value = "/user/settings/account", method = RequestMethod.GET)
    public String settingsAccount(ModelMap model, HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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

    // POST 用户设置 account 页面（更改秘密）
    @RequestMapping(value = "/user/settings/account/changepassword", method = RequestMethod.POST)
    public String settingsAccountChangePassword(@RequestParam(value = "old-password") String oldPassword,
                                                @RequestParam(value = "new-password") String newPassword,
                                                @RequestParam(value = "new-password-repeat") String newPasswordRepeat,
                                                ModelMap model, HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

        final User user = userRepository.getUserFromSession();

        try {
            user.updatePassword(oldPassword, newPassword, newPasswordRepeat);
            userRepository.save(user);
            model.addAttribute("success", "Change password successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", e.getMessage());
        }

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

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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
            List<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model";
    }

    // GET 用户设置 model specific 页面
    @RequestMapping(value = "/user/settings/model/{icmName}", method = RequestMethod.GET)
    public String settingsModelSpecific(@PathVariable String icmName, ModelMap model, HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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
            List<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("currentIcm", currentIcm);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model_specific";
    }

    // POST 用户设置 model specific 页面 update
    @RequestMapping(value = "/user/settings/model/{icmName}/update", method = RequestMethod.POST)
    public String settingsModelSpecificUpdateGo(@PathVariable String icmName,  // 并不使用这个名字，因为可能不准确
                                                @RequestParam(value = "id") Long id,
                                                @RequestParam(value = "name") String name,  // 该名称不能与用户已存在 ICM 重名
                                                @RequestParam(value = "description") String description,
                                                ModelMap model,
                                                HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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
            modelService.updateIcmInfo(user.getId(), id, name, description);
            model.addAttribute("success", "Model information updated successfully.");
        } catch (IllegalArgumentException ie) {  // 重名
            model.addAttribute("error", "Model information updating failed. (Error: " + ie.getMessage() + " )");
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Model information updating failed. (Error: " + e.getMessage() + " )");
        }

        try {
            IndividualConceptualModel currentIcm = modelService.getIcmById(id);
            List<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("currentIcm", currentIcm);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model_specific";
    }

    // POST 用户设置 model specific 页面 delete
    // 仅仅隐去该用户对该 ICM 的查看权，并将 ICM 改名，防止用户再次建立与该名字相同的名字的 ICM；其他任何内容都不删除
    @RequestMapping(value = "/user/settings/model/{icmName}/delete", method = RequestMethod.POST)
    public String settingsModelSpecificDeleteGo(@PathVariable String icmName,  // 并不使用这个名字，因为可能不准确
                                                @RequestParam(value = "id") Long id,
                                                ModelMap model,
                                                HttpServletRequest request) {

        if (migrateService.isRunning()) {
            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Service Unavailable");
            return "service_unavailable";
        }

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
            modelService.deleteIcmInfo(id);
            model.addAttribute("success", "Model information delete successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Model information deletion failed. (Error: " + e.getMessage() + " )");
        }

        try {
            List<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            model.addAttribute("icms", icms);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "user_settings_model";
    }
}

