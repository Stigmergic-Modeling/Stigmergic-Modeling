package cn.edu.pku.sei.dr;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/")
public class StigModController {
    @RequestMapping(method = RequestMethod.GET)
    public String index(ModelMap model) {
        model.addAttribute("host", "localhost");
        model.addAttribute("port", "9999");
//        model.addAttribute("title", "SM");
        return "index";
    }
}