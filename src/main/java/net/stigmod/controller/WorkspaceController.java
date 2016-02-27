/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.node.IndividualConceptualModel;
import net.stigmod.domain.node.User;
import net.stigmod.domain.page.PageData;
import net.stigmod.domain.page.WorkspacePageData;
import net.stigmod.repository.node.UserRepository;
import net.stigmod.service.ModelService;
import net.stigmod.service.WorkspaceService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;

//import net.stigmod.repository.MovieRepository;

/**
 * Handle workspace page requests
 *
 * @version     2016/02/03
 * @author 	    Shijun Wang
 */
@Controller
public class WorkspaceController {

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    @Autowired
    UserRepository userRepository;

    @Autowired
    ModelService modelService;

    @Autowired
    WorkspaceService workspaceService;

    private final static Logger logger = LoggerFactory.getLogger(WorkspaceController.class);

    // GET Workspace 页面
    @RequestMapping(value = "/{icmName}/workspace", method = RequestMethod.GET)
    public String workspace(@PathVariable String icmName, ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }
        // TODO: Try-Catch
        IndividualConceptualModel currentIcm = modelService.getIcmOfUserByName(user, icmName);
        Set<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
        PageData pageData = new WorkspacePageData(user, currentIcm, icms);

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("currentIcm", currentIcm);
        model.addAttribute("icms", icms);
        model.addAttribute("data", pageData.toJsonString());
        model.addAttribute("title", "workspace");
        return "workspace";
    }

    // Workspace 页面 Synchronize Ajax POST
    @RequestMapping(value = "/{icmName}/workspace", method = RequestMethod.POST)
    @ResponseBody
    public String workspace(@PathVariable String icmName, @RequestBody String requestBody, ModelMap model) {

        workspaceService.testNeo4jSaving(1L, 2L);

        return "Good! " + requestBody;
    }

}

