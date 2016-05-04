/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.controller;

import net.stigmod.domain.system.SystemInfo;
import net.stigmod.repository.node.SystemInfoRepository;
import net.stigmod.service.migrateService.MigrateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;

/**
 * @author Shijun Wang
 * @version 2016/5/4
 */
@Controller
public class ScheduledTaskController {

    @Autowired
    private MigrateService migrateService;

    @Autowired
    private SystemInfoRepository systemInfoRepository;


    /**
     * 接收由 SessionService 发来的 http 请求，执行融合操作
     * @return string
     */
    @RequestMapping(value="/scheduled", method = RequestMethod.GET)
    @ResponseBody
    public String runTask() {
        this.checkMerging();
        return "[ Merging Done ]";
    }

    /**
     * 融合
     */
    private void checkMerging() {

        // “有必要”并“可以”执行融合算法
        SystemInfo systemInfo = systemInfoRepository.getSystemInfo();
        if (systemInfo == null) {  // 说明系统刚刚初始化
            systemInfoRepository.save(new SystemInfo());
            return;
        }

        System.out.println("[ " + new Date().toString() + " ] Total number of online users: "
                + "0" + ". Model merging is feasible.");

        Long activatedCcmId1 = systemInfo.getActivatedCcmId1();
        Long activatedCcmId2 = systemInfo.getActivatedCcmId2();
        if (activatedCcmId1 > 0L) {  // 默认值 0，说明还没有真正被设置为活跃的 CCM
            migrateService.migrateAlgorithmImpls(activatedCcmId1);
        }
        if (activatedCcmId2 > 0L) {  // 默认值 0，说明还没有真正被设置为活跃的 CCM
            migrateService.migrateAlgorithmImpls(activatedCcmId2);
        }

    }


}
