package net.stigmod.controller;

//import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;  // 用于向vm模板中传递csrf token
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import net.stigmod.repository.UserRepository;

import javax.servlet.http.HttpServletRequest;  // 用于向vm模板中传递csrf token

@Controller
public class StigModController {

    // Common settings
    String host = "localhost";
    String port = "9999";

    @Autowired
    UserRepository userRepository;

    // front page
    @RequestMapping(value="/", method = RequestMethod.GET)
    public String index(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "index");
        return "index";
    }

    // about this web app
    @RequestMapping(value="/about", method = RequestMethod.GET)
    public String about(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "about");
        return "about";
    }

    // sign up page GET
    @RequestMapping(value="/reg", method = RequestMethod.GET)
    public String reg(ModelMap model, HttpServletRequest request) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign Up");

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        return "reg";
    }

    // sign up page POST
    @RequestMapping(value="/reg", method = RequestMethod.POST)
    public String regPost(
            @RequestParam(value = "mail") String mail,
            @RequestParam(value = "password") String password,
            @RequestParam(value = "password-repeat") String passwordRepeat,
            ModelMap model) {
        try {
            userRepository.register(mail, password, passwordRepeat);
//            return "forward:/user/" + mail;
            return "index";
        } catch(Exception e) {
            return "reg";
//            model.addAttribute("j_username", mail);
//            model.addAttribute("error", e.getMessage());
//            return "/auth/registerpage";
        }
//        return "reg";
    }

    // sign in page GET
    @RequestMapping(value="/login", method = RequestMethod.GET)
    public String login(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign In");
        return "login";
    }
}