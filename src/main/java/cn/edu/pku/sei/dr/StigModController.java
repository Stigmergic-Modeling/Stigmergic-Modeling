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

    @RequestMapping(value="/", method = RequestMethod.GET)
    public String index(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "index");

//        List<Integer> allProducts = new ArrayList<Integer>();
//        allProducts.addAll(Arrays.asList(4, 5, 6));
//        System.out.println(allProducts);
//        model.addAttribute("allProducts", allProducts);
//
//        List<String> customerList = new ArrayList<String>();
//        customerList.addAll(Arrays.asList("Zhang San", "Li Si", "Wang Wu"));
//        System.out.println(customerList);
//        model.addAttribute("customerList", customerList);

        return "index";
    }

    @RequestMapping(value="/reg", method = RequestMethod.GET)
    public String reg(ModelMap model) {
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "Sign Up");
        return "reg";
    }
}