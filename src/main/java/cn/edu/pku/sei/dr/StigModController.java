package cn.edu.pku.sei.dr;

//import java.util.*;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class StigModController {

    // Common settings
    String host = "localhost";
    String port = "9999";

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
    public String reg(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign Up");
        return "reg";
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