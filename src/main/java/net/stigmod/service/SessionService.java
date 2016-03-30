/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.service;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.system.SystemInfo;
import net.stigmod.repository.node.SystemInfoRepository;
import net.stigmod.service.migrateService.MigrateService;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author Shijun Wang
 * @version 2016/3/19
 */
@Service
public class SessionService {

    private Config config = ConfigLoader.load();
    private Boolean isScheduledTaskOn = config.getIsScheduledTaskOn();

    @Autowired
    private MigrateService migrateService;

    @Autowired
    private SystemInfoRepository systemInfoRepository;

    private SessionRegistry sessionRegistry;  // 通过 XML 配置注入 bean，用以获取当前在线人数

    private boolean alreadyRunAfterAllUsersOffline = true;  // true 初值使得刚刚启动的时候不会执行融合

    /**
     * 定时任务，在需要融合时执行融合算法
     */
    @Scheduled(fixedDelay = 30000L)  // 30s 检查一次是否“有必要”并“可以”执行融合算法
    public void checkMerging() {

        if (isScheduledTaskOn) {  // 由配置文件控制是否开启定时任务
            long onlineUserNum = this.getOnlineUserNumber();

            // “有必要”但“不可以”执行融合算法
            if (onlineUserNum > 0) {  // 当前有用户在建模，等待所有用户完成操作后再执行融合算法
                System.out.println("[ " + new Date().toString() + " ] Total number of online users: "
                        + onlineUserNum + ". Model merging is necessary. Waiting for its feasibility.");
                alreadyRunAfterAllUsersOffline = false;  // 用户在线，等用户下线后有必要再跑一遍融合算法
                return;
            }

            // “没必要”执行融合算法
            if (alreadyRunAfterAllUsersOffline || migrateService.isRunning()) {
                return;
            }

            // “有必要”并“可以”执行融合算法
            SystemInfo systemInfo = systemInfoRepository.getSystemInfo();
            if (systemInfo == null) {  // 说明系统刚刚初始化
                systemInfoRepository.save(new SystemInfo());
                return;
            }

            Long activatedCcmId = systemInfo.getActivatedCcmId();
            if (activatedCcmId == -1L) {  // 默认值 -1，说明还没有真正被设置为活跃的 CCM
                return;
            }

            System.out.println("[ " + new Date().toString() + " ] Total number of online users: "
                    + onlineUserNum + ". Model merging is feasible.");
            migrateService.migrateAlgorithmImpls(activatedCcmId);
            alreadyRunAfterAllUsersOffline = true;
        }
    }

    /**
     * 返回在线人数（同一账户多人同时登录时，重复计算人数）
     * @return 在线人数
     */
    public long getOnlineUserNumber() {
        List<Object> principals = sessionRegistry.getAllPrincipals();
        return principals.size();
    }

    public SessionRegistry getSessionRegistry() {
        return sessionRegistry;
    }

    public void setSessionRegistry(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }
}
