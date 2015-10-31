package net.stigmod.controller;


import net.stigmod.domain.User;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
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

import net.stigmod.repository.UserRepository;

import javax.servlet.http.HttpServletRequest;  // 用于向vm模板中传递csrf token
import javax.servlet.http.HttpServletResponse;

@Controller
public class StigModController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

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
        final User user = userRepository.getUserFromSession();
        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "about");
        return "about";
    }

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
            @RequestParam(value = "mail") String mail,
            @RequestParam(value = "password") String password,
            @RequestParam(value = "password-repeat") String passwordRepeat,
            ModelMap model) {
        try {
            userRepository.register(mail, password, passwordRepeat);
            return "redirect:/user";
        } catch(Exception e) {
            e.printStackTrace();
            return "redirect:/about";
        }
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
}