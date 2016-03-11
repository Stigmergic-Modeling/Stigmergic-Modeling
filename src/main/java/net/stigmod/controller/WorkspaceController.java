/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.info.CcmDetail;
import net.stigmod.domain.info.IcmDetail;
import net.stigmod.domain.info.ModelingResponse;
import net.stigmod.domain.page.UserPageData;
import net.stigmod.domain.system.CollectiveConceptualModel;
import net.stigmod.domain.system.IndividualConceptualModel;
import net.stigmod.domain.system.User;
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

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);

        try {
            IndividualConceptualModel currentIcm = modelService.getIcmOfUserByName(user, icmName);
            Set<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            Long ccmId = modelService.getCcmIdOfIcm(currentIcm.getId());  // 获取 ICM 对应的 CCM 的 ID
            IcmDetail icmDetail = workspaceService.getIcmDetail(currentIcm.getId());  // 获取 ICM 实际内容
            PageData pageData = new WorkspacePageData(user, currentIcm, icms, ccmId, icmDetail);

            model.addAttribute("currentIcm", currentIcm);
            model.addAttribute("icms", icms);
            model.addAttribute("data", pageData.toJsonString());
            model.addAttribute("title", "Workspace");
            return "workspace";

        } catch (Exception e) {
            e.printStackTrace();
            PageData pageData = new UserPageData(modelService.getAllIcmsOfUser(user));
            model.addAttribute("data", pageData.toJsonString());
            model.addAttribute("error", e);
            model.addAttribute("title", "User");
            return "user";
        }
    }

    // Ajax POST Workspace 页面 Synchronize
    @RequestMapping(value = "/{icmName}/workspace", method = RequestMethod.POST)
    @ResponseBody
    public ModelingResponse workspace(@PathVariable String icmName, @RequestBody String modelingOperationLogJsonString) {
        try {
            return workspaceService.syncModelingOperations(modelingOperationLogJsonString);
        } catch (Exception e) {
            e.printStackTrace();
            return new ModelingResponse();
        }
    }

    // Ajax GET Workspace 页面 getCCM
    @RequestMapping(value = "/{icmName}/getccm", method = RequestMethod.GET)
    @ResponseBody
    public CcmDetail getCcm(@PathVariable String icmName, @RequestParam("ccmId") Long ccmId) {
        try {
            return workspaceService.getCcmDetail(ccmId);
        } catch (Exception e) {
            e.printStackTrace();
            return new CcmDetail();
        }
    }

    // GET ModelInfo 页面
    @RequestMapping(value = "/{icmName}/info", method = RequestMethod.GET)
    public String modelInfo(@PathVariable String icmName, ModelMap model, HttpServletRequest request) {
        final User user = userRepository.getUserFromSession();

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("user", user);
        model.addAttribute("host", host);
        model.addAttribute("port", port);

        try {
            IndividualConceptualModel currentIcm = modelService.getIcmOfUserByName(user, icmName);
            Set<IndividualConceptualModel> icms = modelService.getAllIcmsOfUser(user);
            CollectiveConceptualModel currentCcm = modelService.getCcmOfUserByIcmId(currentIcm.getId());

            model.addAttribute("currentIcm", currentIcm);
            model.addAttribute("currentCcm", currentCcm);
            model.addAttribute("icms", icms);
            model.addAttribute("title", "Model Info");
            return "model_info";

        } catch (Exception e) {
            e.printStackTrace();
            PageData pageData = new UserPageData(modelService.getAllIcmsOfUser(user));
            model.addAttribute("data", pageData.toJsonString());
            model.addAttribute("error", e);
            model.addAttribute("title", "User");
            return "user";
        }
    }
}

