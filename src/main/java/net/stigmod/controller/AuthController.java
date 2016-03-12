/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.repository.node.UserRepository;
import net.stigmod.service.MailService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;  // 用于向vm模板中传递csrf token
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;  // 用于向vm模板中传递csrf token
import javax.servlet.http.HttpServletResponse;

/**
 * Handle StigMod base requests
 *
 * @version     2016/01/23
 * @author 	    Shijun Wang
 */
@Controller
public class AuthController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    @Autowired
    UserRepository userRepository;

    @Autowired
    MailService mailService;

    private final static Logger logger = LoggerFactory.getLogger(AuthController.class);

    // sign up page GET
    @RequestMapping(value="/signup", method = RequestMethod.GET)
    public String reg(ModelMap model, HttpServletRequest request) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign Up");

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        return "signup";
    }

    // sign up page POST
    @RequestMapping(value="/signup", method = RequestMethod.POST)
    public String regPost(
            @RequestParam(value = "name") String name,
            @RequestParam(value = "mail") String mail,
            @RequestParam(value = "password") String password,
            @RequestParam(value = "password-repeat") String passwordRepeat,
            ModelMap model, HttpServletRequest request) {

        try {
            String verificationId = userRepository.register(name, mail, password, passwordRepeat);
            return "redirect:/checkmail?mail=" + mail + "&verificationId=" + verificationId;

        } catch(Exception e) {
            e.printStackTrace();

            // CSRF token
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                model.addAttribute("_csrf", csrfToken);
            }

            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Sign Up");
            model.addAttribute("name", name);
            model.addAttribute("mail", mail);
            model.addAttribute("error", e.getMessage());
            return "signup";
        }
    }

    // sign up verification GET
    @RequestMapping(value="/signup/verify", method = RequestMethod.GET)
    public String regVerify(@RequestParam(value = "id") String id, ModelMap model, HttpServletRequest request) {

        try {
            userRepository.registerVerify(id);
            return "redirect:/user";  // 激活账户成功

        } catch(Exception e) {
            e.printStackTrace();

            // CSRF token
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                model.addAttribute("_csrf", csrfToken);
            }

            model.addAttribute("host", host);
            model.addAttribute("port", port);
            model.addAttribute("title", "Sign Up");
//            model.addAttribute("error", "There are something wrong with activation. Please re-signup.");
//            model.addAttribute("name", name);
//            model.addAttribute("mail", mail);
            model.addAttribute("error", e.getMessage());
            return "signup";
        }
    }

    // check mail page GET
    @RequestMapping(value="/checkmail", method = RequestMethod.GET)
    public String checkMail(@RequestParam("mail") String mail, @RequestParam("verificationId") String verificationId,
                            ModelMap model, HttpServletRequest request) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Check Mail");
        model.addAttribute("mail", mail);
        model.addAttribute("verificationId", verificationId);

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        return "check_mail";
    }

    // check mail resend POST
    @RequestMapping(value="/checkmail/resend", method = RequestMethod.POST)
    public String checkMailResend(@RequestParam("mail") String mail, @RequestParam("verificationId") String verificationId,
                                  ModelMap model, HttpServletRequest request) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Check Mail");
        model.addAttribute("mail", mail);

        try {
            String newVerId =  userRepository.resendRegisterEmail(verificationId);
            model.addAttribute("verificationId", newVerId);
            model.addAttribute("success", "Email resent successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("verificationId", verificationId);
            model.addAttribute("error", e.getMessage());
        }

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        return "check_mail";
    }

    // sign in page GET  (POST route is taken care of by Spring-Security)
    @RequestMapping(value="/signin", method = RequestMethod.GET)
    public String login(ModelMap model, HttpServletRequest request) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign In");

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        return "signin";
    }

    // sign out
    @RequestMapping(value="/signout", method = RequestMethod.GET)
    public String logout (HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null){
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return "redirect:/signin";
    }

    // Denied page GET
    @RequestMapping(value="/denied", method = RequestMethod.GET)
    public String reg(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Denied");

        return "denied";
    }

}