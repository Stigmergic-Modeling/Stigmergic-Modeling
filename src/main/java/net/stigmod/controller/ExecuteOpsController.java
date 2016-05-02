/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.info.ModelingResponse;
import net.stigmod.service.WorkspaceService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.template.Neo4jOperations;
import org.springframework.data.neo4j.template.Neo4jTemplate;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

/**
 * 用于测试建模序列
 *
 * @author Shijun Wang
 * @version 2016/4/29
 */


@Controller
public class ExecuteOpsController {

    @Autowired
    WorkspaceService workspaceService;

    @Autowired
    Neo4jOperations neo4jTemplate;

    // Common settings
    private Config config = ConfigLoader.load();
    private String host = config.getHost();
    private String port = config.getPort();

    // executeops page GET
    @RequestMapping(value="/executeops", method = RequestMethod.GET)
    public String executeOps(ModelMap model, HttpServletRequest request) {

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "EXEOPS");

        return "executeops";
    }

    // executeops page POST
    @RequestMapping(value="/executeops", method = RequestMethod.POST)
    public String doExecuteOps(ModelMap model, HttpServletRequest request, @RequestParam(value = "ops") String ops) {

        // CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }

        model.addAttribute("host", host);
        model.addAttribute("port", port);
        model.addAttribute("title", "EXEOPS");

//        System.out.println(ops);
        try {
            neo4jTemplate.query("MATCH (n:Class) DETACH DELETE n", new HashMap<String, Object>());  // 清空模型
            neo4jTemplate.query("MATCH (n:Relationship) DETACH DELETE n", new HashMap<String, Object>());  // 清空模型
            neo4jTemplate.query("MATCH (n:Value) DETACH DELETE n", new HashMap<String, Object>());  // 清空模型
            neo4jTemplate.query("MATCH (n:Order) DETACH DELETE n", new HashMap<String, Object>());  // 清空模型
            neo4jTemplate.query("MATCH (n:ICM) SET n.frontIdList=[], n.backIdList=[]", new HashMap<String, Object>());  // 清空模型
            neo4jTemplate.query("MATCH (n:ModOps) SET n.ops=[]", new HashMap<String, Object>());  // 清空模型

            workspaceService.syncModelingOperations(ops);  // 执行建模操作
            model.addAttribute("success", "OK!");

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "FAILED!");
        }

        model.addAttribute("ops", ops);
        return "executeops";
    }

}
